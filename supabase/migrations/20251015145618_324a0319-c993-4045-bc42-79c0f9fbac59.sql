-- 1. Remover função antiga e recriar com tipos corretos
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
  comments jsonb
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
    COALESCE(pc.custom_fields->'comments', '[]'::jsonb) as comments
  FROM public.project_cards pc
  ORDER BY pc.position ASC;
END;
$$;

-- 2. RPC para buscar o cartão completo com attachments (admin only)
CREATE OR REPLACE FUNCTION public.get_card_full_admin(_user_id uuid, _card_id uuid)
RETURNS public.project_cards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result public.project_cards%ROWTYPE;
BEGIN
  IF NOT has_role(_user_id, 'admin'::user_role) THEN
    RAISE EXCEPTION 'Only admins can view card details';
  END IF;

  SELECT * INTO result
  FROM public.project_cards
  WHERE id = _card_id;

  RETURN result;
END;
$$;

-- 3. Índices para acelerar as queries
CREATE INDEX IF NOT EXISTS idx_project_cards_list_position ON public.project_cards (list_id, position);
CREATE INDEX IF NOT EXISTS idx_project_lists_board_position ON public.project_lists (board_id, position);
CREATE INDEX IF NOT EXISTS idx_project_cards_list ON public.project_cards (list_id);
CREATE INDEX IF NOT EXISTS idx_project_lists_board ON public.project_lists (board_id);