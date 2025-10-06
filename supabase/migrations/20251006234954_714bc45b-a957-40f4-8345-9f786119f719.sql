-- Criar política de INSERT para project_cards
-- Permite que membros do board criem cartões em suas listas

CREATE POLICY "Board members/admins can create cards via fn"
ON public.project_cards
FOR INSERT
TO authenticated
WITH CHECK (
  user_can_manage_card_on_list(auth.uid(), list_id)
);