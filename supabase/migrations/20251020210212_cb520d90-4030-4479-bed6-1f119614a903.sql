-- Atualizar função para incluir attachments no retorno
DROP FUNCTION IF EXISTS public.get_all_cards_admin_light(uuid);

CREATE FUNCTION public.get_all_cards_admin_light(_user_id uuid)
RETURNS TABLE(
  id uuid,
  list_id uuid,
  title text,
  description text,
  status text,
  priority text,
  due_date timestamptz,
  start_date timestamptz,
  estimated_hours integer,
  actual_hours integer,
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
  comments jsonb,
  attachments jsonb,
  attachments_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(_user_id, 'admin'::user_role) THEN
    RAISE EXCEPTION 'Only admins can view all cards';
  END IF;

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
    pc.position as card_position,
    pc.cover,
    pc.location,
    pc.archived,
    pc.watching,
    pc.created_by,
    pc.client_id,
    pc.created_at,
    pc.updated_at,
    COALESCE(pc.custom_fields->'checklists', '[]'::jsonb) as checklists,
    COALESCE(pc.custom_fields->'comments', '[]'::jsonb) as comments,
    COALESCE(pc.custom_fields->'attachments', '[]'::jsonb) as attachments,
    jsonb_array_length(COALESCE(pc.custom_fields->'attachments', '[]'::jsonb))::integer as attachments_count
  FROM public.project_cards pc
  ORDER BY pc.position ASC;
END;
$$;