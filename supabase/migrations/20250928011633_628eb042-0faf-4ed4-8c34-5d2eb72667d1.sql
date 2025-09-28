-- Limpar boards duplicados e listas desnecessárias
DELETE FROM project_lists WHERE id NOT IN (
  SELECT DISTINCT ON (board_id, title) id 
  FROM project_lists 
  ORDER BY board_id, title, created_at ASC
);

-- Remover o board mais recente duplicado
DELETE FROM project_boards WHERE id = 'b08c7610-a1cc-4fb6-90fb-a597c7c3adbb';

-- Atualizar as listas restantes para usar as cores e títulos corretos
UPDATE project_lists SET 
  title = 'A Fazer',
  color = '#f59e0b'
WHERE title = 'A fazer';

UPDATE project_lists SET 
  title = 'Aguardando Aprovação',
  color = '#f59e0b'
WHERE title = 'Aguardando aprovação';

UPDATE project_lists SET 
  title = 'Executado',
  color = '#f59e0b'
WHERE title = 'Finalizado';