-- Create trigger to notify when a member is assigned to a card
CREATE OR REPLACE FUNCTION notify_card_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _card_title TEXT;
  _member_user_id UUID;
  _assigner_name TEXT;
BEGIN
  -- Get card title
  SELECT title INTO _card_title 
  FROM project_cards 
  WHERE id = NEW.card_id;
  
  -- Get member's user_id
  SELECT user_id INTO _member_user_id
  FROM project_members
  WHERE id = NEW.member_id;
  
  -- Get assigner name (if available)
  SELECT full_name INTO _assigner_name
  FROM profiles
  WHERE user_id = auth.uid();
  
  -- Create notification for the assigned member
  IF _member_user_id IS NOT NULL THEN
    PERFORM create_notification(
      _member_user_id,
      'assignment',
      'Você foi atribuído a um card',
      COALESCE(_assigner_name, 'Alguém') || ' atribuiu você ao card "' || _card_title || '"',
      'medium',
      '/projetos?card=' || NEW.card_id,
      'card',
      NEW.card_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_card_assignment ON project_card_assignees;

-- Create trigger for card assignments
CREATE TRIGGER on_card_assignment
  AFTER INSERT ON project_card_assignees
  FOR EACH ROW
  EXECUTE FUNCTION notify_card_assignment();