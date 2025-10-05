-- Atualizar a função user_has_card_access para restringir visualização apenas a cards onde o usuário é assignee
-- Admins e donos do board continuam vendo tudo
CREATE OR REPLACE FUNCTION public.user_has_card_access(_user_id uuid, _card_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    -- Admins veem tudo
    public.has_role(_user_id, 'admin'::user_role)
    OR
    -- Dono do board vê todos os cards
    EXISTS (
      SELECT 1
      FROM public.project_lists pl
      JOIN public.project_boards pb ON pb.id = pl.board_id
      WHERE pl.id = (SELECT list_id FROM public.project_cards WHERE id = _card_id)
        AND pb.user_id = _user_id
    )
    OR
    -- Usuário assignado ao card vê apenas esse card
    EXISTS (
      SELECT 1
      FROM public.project_card_assignees a
      JOIN public.project_members pm ON pm.id = a.member_id
      WHERE a.card_id = _card_id AND pm.user_id = _user_id
    );
$function$;