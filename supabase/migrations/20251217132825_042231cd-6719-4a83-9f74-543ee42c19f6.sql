-- Create optimized RPC to get board cards for a user
-- This function bypasses expensive per-row RLS checks by doing a single board access check
CREATE OR REPLACE FUNCTION public.get_user_board_cards(_user_id uuid, _board_id uuid)
RETURNS TABLE(
  id uuid,
  list_id uuid,
  title text,
  description text,
  status text,
  priority text,
  due_date timestamp with time zone,
  start_date timestamp with time zone,
  estimated_hours integer,
  actual_hours integer,
  card_position integer,
  cover text,
  location jsonb,
  archived boolean,
  watching boolean,
  created_by uuid,
  client_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  checklists jsonb,
  comments jsonb,
  attachments_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- First check if user has access to this board (single check, not per-card)
  IF NOT user_has_board_access(_user_id, _board_id) THEN
    RAISE EXCEPTION 'User does not have access to this board';
  END IF;

  -- Return all cards for this board efficiently
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
    jsonb_array_length(COALESCE(pc.custom_fields->'attachments', '[]'::jsonb))::integer as attachments_count
  FROM public.project_cards pc
  JOIN public.project_lists pl ON pl.id = pc.list_id
  WHERE pl.board_id = _board_id
  ORDER BY pc.position ASC;
END;
$$;