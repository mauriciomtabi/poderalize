-- Atualizar etiquetas existentes para os novos nomes e cores de prioridade
UPDATE project_labels
SET 
  name = 'Crítico',
  color = '#ef4444',
  description = 'Prioridade crítica'
WHERE name = 'Bug' OR name = 'Urgent';

UPDATE project_labels
SET 
  name = 'Alta',
  color = '#f97316',
  description = 'Prioridade alta'
WHERE name = 'Feature';

UPDATE project_labels
SET 
  name = 'Média',
  color = '#f59e0b',
  description = 'Prioridade média'
WHERE name = 'Design';

UPDATE project_labels
SET 
  name = 'Baixa',
  color = '#22c55e',
  description = 'Prioridade baixa'
WHERE name = 'Review';