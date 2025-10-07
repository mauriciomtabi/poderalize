-- Fix the existing monthly automation that has wrong next_creation_at
UPDATE recurring_cards 
SET next_creation_at = '2025-11-06 22:50:00+00'
WHERE id = '13085003-11ef-46f9-ac49-eff55f8ef3bc' 
  AND frequency = 'monthly';

-- Add a comment explaining the fix
COMMENT ON TABLE recurring_cards IS 'Recurring cards automation - Fixed monthly date calculation to preserve day_of_month';