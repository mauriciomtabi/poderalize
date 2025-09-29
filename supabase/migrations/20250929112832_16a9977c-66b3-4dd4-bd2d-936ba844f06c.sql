-- Remove duplicate clients keeping only the most recent one
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY lead_id, user_id ORDER BY created_at DESC) as rn
  FROM clientes 
  WHERE lead_id IS NOT NULL
)
DELETE FROM clientes 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Delete the existing lead that was converted
DELETE FROM leads 
WHERE id = 'a313a6dd-0184-4b40-9319-436e49359e7d' AND status_simple = 'perdido';