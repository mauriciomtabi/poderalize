-- Add end_date column to recurring_cards table
ALTER TABLE recurring_cards 
ADD COLUMN end_date timestamp with time zone;

-- Add comment explaining the column
COMMENT ON COLUMN recurring_cards.end_date IS 'Optional end date for recurring automation - automation stops after this date';