-- Helper function to check if a user can view a specific card
create or replace function public.user_can_view_card(_user_id uuid, _card_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(_user_id, 'admin'::user_role)
  or exists (
    select 1
    from public.project_card_assignees a
    join public.project_members pm on pm.id = a.member_id
    where a.card_id = _card_id
      and pm.user_id = _user_id
  )
  or exists (
    select 1
    from public.project_cards pc
    join public.project_lists pl on pl.id = pc.list_id
    join public.project_boards pb on pb.id = pl.board_id
    where pc.id = _card_id
      and pb.user_id = _user_id
  );
$$;

-- Drop existing conflicting policies
drop policy if exists "Users can view cards assigned to them or boards they own or admin" on public.project_cards;
drop policy if exists "Assignees or admins can select cards" on public.project_cards;

-- New policy: Only assignees, board owners, or admins can view cards
create policy "Users can view assigned cards or owned boards"
on public.project_cards
for select
using (public.user_can_view_card(auth.uid(), id));