-- Add 'biweekly' to recurrence_frequency enum
ALTER TYPE recurrence_frequency ADD VALUE 'biweekly';

-- Comment explaining the new value
COMMENT ON TYPE recurrence_frequency IS 'Frequency options: daily, weekly, biweekly (quinzenal), monthly';