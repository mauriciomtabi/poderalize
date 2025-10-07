-- CRITICAL FIX: Adicionar proteções para evitar remoção acidental de admins

-- Criar tabela de auditoria de exclusões
CREATE TABLE IF NOT EXISTS public.user_deletion_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_user_id uuid NOT NULL,
  deleted_user_email text NOT NULL,
  deleted_user_name text,
  deleted_by_user_id uuid NOT NULL,
  deleted_by_email text NOT NULL,
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  had_admin_role boolean NOT NULL DEFAULT false,
  deletion_reason text
);

ALTER TABLE public.user_deletion_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view deletion audit"
ON public.user_deletion_audit
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Recriar a função remove_user_completely com proteções
CREATE OR REPLACE FUNCTION public.remove_user_completely(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_executor_id uuid;
  v_user_email text;
  v_user_name text;
  v_is_admin boolean := false;
  v_admin_count integer;
BEGIN
  -- Obter ID do executor
  v_executor_id := auth.uid();
  
  -- Verificar se é admin executando
  IF NOT has_role(v_executor_id, 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem remover usuários';
  END IF;
  
  -- PROTEÇÃO 1: Impedir auto-exclusão (admin não pode se remover)
  IF v_executor_id = _user_id THEN
    RAISE EXCEPTION 'Você não pode remover sua própria conta. Peça a outro administrador para fazer isso.';
  END IF;
  
  -- Buscar informações do usuário a ser removido
  SELECT email, full_name INTO v_user_email, v_user_name
  FROM public.profiles
  WHERE user_id = _user_id;
  
  -- Verificar se o usuário é admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  ) INTO v_is_admin;
  
  -- PROTEÇÃO 2: Se for remover um admin, verificar se há pelo menos 2 admins
  IF v_is_admin THEN
    SELECT COUNT(*) INTO v_admin_count
    FROM public.user_roles
    WHERE role = 'admin';
    
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'Não é possível remover o último administrador do sistema';
    END IF;
  END IF;
  
  -- Registrar auditoria ANTES de deletar
  INSERT INTO public.user_deletion_audit (
    deleted_user_id,
    deleted_user_email,
    deleted_user_name,
    deleted_by_user_id,
    deleted_by_email,
    had_admin_role
  )
  SELECT 
    _user_id,
    COALESCE(v_user_email, 'email_desconhecido'),
    COALESCE(v_user_name, 'nome_desconhecido'),
    v_executor_id,
    (SELECT email FROM public.profiles WHERE user_id = v_executor_id),
    v_is_admin;
  
  -- Remover SOMENTE dados do usuário específico (_user_id)
  -- IMPORTANTE: Usar WHERE user_id = _user_id em TODAS as queries
  
  DELETE FROM public.user_permissions WHERE user_id = _user_id;
  DELETE FROM public.colaboradores WHERE user_id = _user_id;
  DELETE FROM public.atletas WHERE user_id = _user_id;
  DELETE FROM public.avaliacoes_tecnicas WHERE user_id = _user_id;
  DELETE FROM public.avaliacoes_detalhadas WHERE user_id = _user_id;
  DELETE FROM public.agendamentos_avaliacao WHERE user_id = _user_id;
  DELETE FROM public.captadores WHERE user_id = _user_id;
  DELETE FROM public.categorias WHERE user_id = _user_id;
  DELETE FROM public.contas_bancarias WHERE user_id = _user_id;
  DELETE FROM public.transacoes WHERE user_id = _user_id;
  DELETE FROM public.transferencias WHERE user_id = _user_id;
  DELETE FROM public.emprestimos WHERE user_id = _user_id;
  DELETE FROM public.metas WHERE user_id = _user_id;
  
  -- Remover TODAS as roles do usuário específico
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Remover perfil do usuário
  DELETE FROM public.profiles WHERE user_id = _user_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para debugging
    RAISE NOTICE 'Erro ao remover usuário: %', SQLERRM;
    RAISE;
END;
$function$;

COMMENT ON FUNCTION public.remove_user_completely IS 'Remove usuário completamente com proteções: impede auto-exclusão, impede remoção do último admin, registra auditoria';
