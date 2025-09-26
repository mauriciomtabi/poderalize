-- Criar enum para as páginas/rotas disponíveis
CREATE TYPE public.page_permission AS ENUM (
  'dashboard',
  'projetos',
  'crm',
  'leads',
  'vendas',
  'colaboradores',
  'acompanhamento',
  'relatorios',
  'configuracoes'
);

-- Criar tabela de permissões de usuário
CREATE TABLE public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  page page_permission NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, page)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage all permissions" 
ON public.user_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own permissions" 
ON public.user_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_permissions_updated_at
BEFORE UPDATE ON public.user_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para remover usuário completamente do sistema
CREATE OR REPLACE FUNCTION public.remove_user_completely(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se é admin executando
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem remover usuários';
  END IF;
  
  -- Remover permissões do usuário
  DELETE FROM public.user_permissions WHERE user_id = _user_id;
  
  -- Remover dados relacionados ao usuário nas outras tabelas
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
  
  -- Remover role do usuário
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  
  -- Remover perfil do usuário
  DELETE FROM public.profiles WHERE user_id = _user_id;
  
  RETURN TRUE;
END;
$$;

-- Função para verificar se usuário tem permissão para uma página
CREATE OR REPLACE FUNCTION public.user_has_page_permission(_user_id UUID, _page page_permission)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Admins têm acesso a tudo
  SELECT CASE 
    WHEN has_role(_user_id, 'admin') THEN true
    ELSE COALESCE(
      (SELECT granted FROM public.user_permissions 
       WHERE user_id = _user_id AND page = _page),
      false -- Por padrão, sem permissão
    )
  END;
$$;