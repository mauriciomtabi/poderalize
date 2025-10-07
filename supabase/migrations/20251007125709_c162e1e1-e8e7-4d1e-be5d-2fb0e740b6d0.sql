-- Add assignee_id column to project_checklist_items
ALTER TABLE project_checklist_items 
ADD COLUMN IF NOT EXISTS assignee_id uuid REFERENCES project_members(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_project_checklist_items_assignee 
ON project_checklist_items(assignee_id);

-- Create trigger to notify when assigned to a checklist item
CREATE OR REPLACE FUNCTION notify_checklist_item_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _item_text TEXT;
  _card_title TEXT;
  _card_id UUID;
  _assignee_user_id UUID;
  _assigner_name TEXT;
BEGIN
  -- Only proceed if assignee changed and is not null
  IF (TG_OP = 'UPDATE' AND OLD.assignee_id IS DISTINCT FROM NEW.assignee_id AND NEW.assignee_id IS NOT NULL)
     OR (TG_OP = 'INSERT' AND NEW.assignee_id IS NOT NULL) THEN

    -- Get item text
    _item_text := NEW.text;

    -- Get card info
    SELECT pc.title, pc.id INTO _card_title, _card_id
    FROM project_checklists pcl
    JOIN project_cards pc ON pc.id = pcl.card_id
    WHERE pcl.id = NEW.checklist_id;

    -- Get assignee's user_id
    SELECT user_id INTO _assignee_user_id
    FROM project_members
    WHERE id = NEW.assignee_id;

    -- Get assigner name
    SELECT full_name INTO _assigner_name
    FROM profiles
    WHERE user_id = auth.uid();

    -- Create notification
    IF _assignee_user_id IS NOT NULL THEN
      PERFORM create_notification(
        _assignee_user_id,
        'assignment',
        'Você foi atribuído a uma tarefa',
        COALESCE(_assigner_name, 'Alguém') || ' atribuiu você à tarefa "' ||
        LEFT(_item_text, 50) ||
        CASE WHEN LENGTH(_item_text) > 50 THEN '...' ELSE '' END ||
        '" no card "' || _card_title || '"',
        'medium',
        '/projetos?card=' || _card_id,
        'checklist_item',
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_checklist_item_assignment ON project_checklist_items;

-- Create trigger for checklist item assignments
CREATE TRIGGER on_checklist_item_assignment
  AFTER INSERT OR UPDATE OF assignee_id ON project_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_checklist_item_assignment();