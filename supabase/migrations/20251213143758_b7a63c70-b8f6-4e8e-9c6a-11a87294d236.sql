-- Add column to track when card was moved to current list
ALTER TABLE project_cards ADD COLUMN IF NOT EXISTS moved_to_list_at timestamptz DEFAULT now();

-- Update existing cards to use updated_at as initial value
UPDATE project_cards SET moved_to_list_at = COALESCE(updated_at, created_at) WHERE moved_to_list_at IS NULL;

-- Create function to update moved_to_list_at when list_id changes
CREATE OR REPLACE FUNCTION update_moved_to_list_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.list_id IS DISTINCT FROM NEW.list_id THEN
    NEW.moved_to_list_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic update
DROP TRIGGER IF EXISTS trigger_update_moved_to_list_at ON project_cards;
CREATE TRIGGER trigger_update_moved_to_list_at
  BEFORE UPDATE ON project_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_moved_to_list_at();