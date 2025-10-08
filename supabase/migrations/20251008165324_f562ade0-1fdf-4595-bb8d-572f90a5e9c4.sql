-- Parte 1: Modificar user_has_card_access para restringir acesso apenas a criadores e assignees
-- Remove privilégios automáticos de board owners e members
CREATE OR REPLACE FUNCTION public.user_has_card_access(_user_id uuid, _card_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Users can only see cards if:
  -- 1. They created the card
  -- 2. They are assigned to the card
  RETURN (
    EXISTS (
      SELECT 1 FROM project_cards
      WHERE id = _card_id AND created_by = _user_id
    )
    OR
    EXISTS (
      SELECT 1 
      FROM project_card_assignees a
      JOIN project_members pm ON pm.id = a.member_id
      WHERE a.card_id = _card_id AND pm.user_id = _user_id
    )
  );
END;
$$;

-- Parte 2: Criar função para admins visualizarem todos os cards (bypassa RLS)
CREATE OR REPLACE FUNCTION public.get_all_cards_admin(_user_id uuid)
RETURNS SETOF project_cards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only admins can use this function
  IF NOT has_role(_user_id, 'admin'::user_role) THEN
    RAISE EXCEPTION 'Only admins can view all cards';
  END IF;
  
  RETURN QUERY
  SELECT * FROM project_cards
  ORDER BY position ASC;
END;
$$;