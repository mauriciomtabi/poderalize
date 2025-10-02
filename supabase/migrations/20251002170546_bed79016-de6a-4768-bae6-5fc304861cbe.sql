-- Update user_has_board_access function to include admins
CREATE OR REPLACE FUNCTION public.user_has_board_access(_user_id uuid, _board_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM project_boards 
    WHERE id = _board_id 
    AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 
    FROM project_members 
    WHERE board_id = _board_id 
    AND user_id = _user_id
  ) OR public.has_role(_user_id, 'admin'::user_role);
$$;

-- Create project_activities table if not exists
CREATE TABLE IF NOT EXISTS public.project_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on project_activities
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on project_activities if any
DROP POLICY IF EXISTS "Users can view activities" ON public.project_activities;
DROP POLICY IF EXISTS "Users can manage activities" ON public.project_activities;

-- Create policies for project_activities
CREATE POLICY "Users/admins/assignees can view activities via fn"
ON public.project_activities
FOR SELECT
USING (public.user_has_card_access(auth.uid(), card_id));

CREATE POLICY "Users/admins can manage activities via fn"
ON public.project_activities
FOR ALL
USING (public.user_has_card_access(auth.uid(), card_id))
WITH CHECK (public.user_has_card_access(auth.uid(), card_id));

-- Update project_members policies to include admins
DROP POLICY IF EXISTS "Board owners can insert members" ON public.project_members;
DROP POLICY IF EXISTS "Board owners can update members" ON public.project_members;
DROP POLICY IF EXISTS "Board owners can delete members" ON public.project_members;

CREATE POLICY "Board owners/admins can insert members"
ON public.project_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_boards
    WHERE id = board_id AND user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Board owners/admins can update members"
ON public.project_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM project_boards
    WHERE id = board_id AND user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Board owners/admins can delete members"
ON public.project_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM project_boards
    WHERE id = board_id AND user_id = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin'::user_role)
);

-- Update project_labels policies to include admins
DROP POLICY IF EXISTS "Board members can create labels" ON public.project_labels;
DROP POLICY IF EXISTS "Board members can update labels" ON public.project_labels;
DROP POLICY IF EXISTS "Board members can delete labels" ON public.project_labels;
DROP POLICY IF EXISTS "Users can view labels of boards they have access to" ON public.project_labels;

CREATE POLICY "Board members/admins can create labels"
ON public.project_labels
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_boards
    WHERE id = board_id AND (
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM project_members WHERE board_id = project_boards.id AND user_id = auth.uid())
    )
  ) OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Board members/admins can update labels"
ON public.project_labels
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM project_boards
    WHERE id = board_id AND (
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM project_members WHERE board_id = project_boards.id AND user_id = auth.uid())
    )
  ) OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Board members/admins can delete labels"
ON public.project_labels
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM project_boards
    WHERE id = board_id AND (
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM project_members WHERE board_id = project_boards.id AND user_id = auth.uid())
    )
  ) OR public.has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Users/admins can view labels of accessible boards"
ON public.project_labels
FOR SELECT
USING (
  public.user_has_board_access(auth.uid(), board_id)
);