-- Add start_date to recurring_cards to persist original start date
ALTER TABLE recurring_cards
ADD COLUMN IF NOT EXISTS start_date timestamp with time zone;

COMMENT ON COLUMN recurring_cards.start_date IS 'Original start date configured by the user, preserved for editing/display';