-- Fase 5: Adicionar flag para labels padrão
ALTER TABLE project_boards 
ADD COLUMN IF NOT EXISTS default_labels_created boolean DEFAULT false;