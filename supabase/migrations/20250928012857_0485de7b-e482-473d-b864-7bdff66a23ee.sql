-- Atualizar cor de todas as listas para o laranja da Poderalize
UPDATE project_lists SET 
  color = '#E55A27'
WHERE color = '#f59e0b';

-- Corrigir o título da lista com problema
UPDATE project_lists SET 
  title = 'A Fazer'
WHERE title = 'A Fazerasdsadsda';