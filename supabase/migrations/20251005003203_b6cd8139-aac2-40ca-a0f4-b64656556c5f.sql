-- Trigger para notificar quando card muda de lista
CREATE OR REPLACE FUNCTION public.notify_card_list_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _assignee RECORD;
  _new_list_title TEXT;
  _old_list_title TEXT;
BEGIN
  -- Só processa se a lista mudou
  IF OLD.list_id IS DISTINCT FROM NEW.list_id THEN
    -- Buscar títulos das listas
    SELECT title INTO _old_list_title FROM project_lists WHERE id = OLD.list_id;
    SELECT title INTO _new_list_title FROM project_lists WHERE id = NEW.list_id;
    
    -- Notificar todos os membros atribuídos ao card
    FOR _assignee IN
      SELECT pm.user_id
      FROM project_card_assignees pca
      JOIN project_members pm ON pm.id = pca.member_id
      WHERE pca.card_id = NEW.id
    LOOP
      PERFORM create_notification(
        _assignee.user_id,
        'assignment',
        'Card movido',
        '"' || NEW.title || '" foi movido de "' || COALESCE(_old_list_title, 'lista anterior') || '" para "' || _new_list_title || '"',
        'low',
        '/projetos?card=' || NEW.id,
        'card',
        NEW.id
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_card_list_change
  AFTER UPDATE OF list_id ON public.project_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_card_list_change();