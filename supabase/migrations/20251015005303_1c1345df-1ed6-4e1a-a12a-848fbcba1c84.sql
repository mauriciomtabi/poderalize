-- Criar função RPC leve para admin "ver todos os cards"
-- Esta função retorna apenas os campos essenciais SEM attachments pesados
CREATE OR REPLACE FUNCTION public.get_all_cards_admin_light(_user_id uuid)
 RETURNS TABLE (
   id uuid,
   list_id uuid,
   title text,
   description text,
   status text,
   priority text,
   due_date timestamptz,
   start_date timestamptz,
   estimated_hours numeric,
   actual_hours numeric,
   card_position integer,
   cover text,
   location jsonb,
   archived boolean,
   watching boolean,
   created_by uuid,
   client_id uuid,
   created_at timestamptz,
   updated_at timestamptz,
   checklists jsonb,
   comments jsonb
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Apenas admins podem usar esta função
  IF NOT has_role(_user_id, 'admin'::user_role) THEN
    RAISE EXCEPTION 'Only admins can view all cards';
  END IF;
  
  -- Retornar todos os cards com campos específicos do custom_fields
  -- SEM incluir attachments (que são pesados)
  RETURN QUERY
  SELECT 
    pc.id,
    pc.list_id,
    pc.title,
    pc.description,
    pc.status,
    pc.priority,
    pc.due_date,
    pc.start_date,
    pc.estimated_hours,
    pc.actual_hours,
    pc."position" as card_position,
    pc.cover,
    pc.location,
    pc.archived,
    pc.watching,
    pc.created_by,
    pc.client_id,
    pc.created_at,
    pc.updated_at,
    COALESCE(pc.custom_fields->'checklists', '[]'::jsonb) as checklists,
    COALESCE(pc.custom_fields->'comments', '[]'::jsonb) as comments
  FROM project_cards pc
  ORDER BY pc."position" ASC;
END;
$function$;