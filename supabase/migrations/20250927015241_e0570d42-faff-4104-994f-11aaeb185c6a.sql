-- Create project boards table
CREATE TABLE public.project_boards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  settings JSONB NOT NULL DEFAULT '{"visibility": "private", "allowComments": true, "allowVoting": false, "cardAging": false, "calendarFeed": false}',
  background JSONB DEFAULT '{"type": "color", "value": "#1e293b"}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project lists table
CREATE TABLE public.project_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.project_boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  position INTEGER NOT NULL DEFAULT 0,
  archived BOOLEAN NOT NULL DEFAULT false,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  rules JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project labels table
CREATE TABLE public.project_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.project_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project members table
CREATE TABLE public.project_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES public.project_boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  added_by UUID,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(board_id, user_id)
);

-- Create project cards table
CREATE TABLE public.project_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.project_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  cover TEXT,
  location JSONB,
  custom_fields JSONB DEFAULT '{}',
  archived BOOLEAN NOT NULL DEFAULT false,
  watching BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project card labels junction table
CREATE TABLE public.project_card_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.project_cards(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.project_labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(card_id, label_id)
);

-- Create project card assignees junction table
CREATE TABLE public.project_card_assignees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.project_cards(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.project_members(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(card_id, member_id)
);

-- Create project comments table
CREATE TABLE public.project_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.project_cards(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  author UUID NOT NULL,
  author_name TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  edited_at TIMESTAMP WITH TIME ZONE
);

-- Create project attachments table
CREATE TABLE public.project_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.project_cards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project checklists table
CREATE TABLE public.project_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.project_cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project checklist items table
CREATE TABLE public.project_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.project_checklists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date TIMESTAMP WITH TIME ZONE,
  assignee UUID,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project activities table
CREATE TABLE public.project_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.project_cards(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  author UUID NOT NULL,
  author_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.project_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_card_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_card_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_boards
CREATE POLICY "Users can view boards they own or are members of" ON public.project_boards
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.project_members WHERE board_id = project_boards.id AND user_id = auth.uid())
);

CREATE POLICY "Users can create their own boards" ON public.project_boards
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Board owners can update their boards" ON public.project_boards
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Board owners can delete their boards" ON public.project_boards
FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for project_lists
CREATE POLICY "Users can view lists of boards they have access to" ON public.project_lists
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_boards 
    WHERE id = project_lists.board_id 
    AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = project_boards.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can create lists" ON public.project_lists
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_boards 
    WHERE id = project_lists.board_id 
    AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = project_boards.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can update lists" ON public.project_lists
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.project_boards 
    WHERE id = project_lists.board_id 
    AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = project_boards.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can delete lists" ON public.project_lists
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.project_boards 
    WHERE id = project_lists.board_id 
    AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = project_boards.id AND user_id = auth.uid()))
  )
);

-- RLS Policies for project_labels
CREATE POLICY "Users can view labels of boards they have access to" ON public.project_labels
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_boards 
    WHERE id = project_labels.board_id 
    AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = project_boards.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can create labels" ON public.project_labels
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_boards 
    WHERE id = project_labels.board_id 
    AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = project_boards.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can update labels" ON public.project_labels
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.project_boards 
    WHERE id = project_labels.board_id 
    AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = project_boards.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can delete labels" ON public.project_labels
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.project_boards 
    WHERE id = project_labels.board_id 
    AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = project_boards.id AND user_id = auth.uid()))
  )
);

-- RLS Policies for project_members
CREATE POLICY "Users can view members of boards they have access to" ON public.project_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_boards 
    WHERE id = project_members.board_id 
    AND (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.board_id = project_boards.id AND pm.user_id = auth.uid()))
  )
);

CREATE POLICY "Board owners can manage members" ON public.project_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.project_boards 
    WHERE id = project_members.board_id AND user_id = auth.uid()
  )
);

-- RLS Policies for project_cards
CREATE POLICY "Users can view cards of boards they have access to" ON public.project_cards
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_lists pl
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pl.id = project_cards.list_id 
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can create cards" ON public.project_cards
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_lists pl
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pl.id = project_cards.list_id 
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can update cards" ON public.project_cards
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.project_lists pl
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pl.id = project_cards.list_id 
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can delete cards" ON public.project_cards
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.project_lists pl
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pl.id = project_cards.list_id 
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

-- Apply similar policies to junction tables and related tables
CREATE POLICY "Users can view card labels for accessible cards" ON public.project_card_labels
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_card_labels.card_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can manage card labels" ON public.project_card_labels
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_card_labels.card_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Users can view card assignees for accessible cards" ON public.project_card_assignees
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_card_assignees.card_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can manage card assignees" ON public.project_card_assignees
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_card_assignees.card_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

-- Apply similar policies to other related tables
CREATE POLICY "Users can view comments for accessible cards" ON public.project_comments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_comments.card_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can manage comments" ON public.project_comments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_comments.card_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Users can view attachments for accessible cards" ON public.project_attachments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_attachments.card_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can manage attachments" ON public.project_attachments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_attachments.card_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Users can view checklists for accessible cards" ON public.project_checklists
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_checklists.card_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can manage checklists" ON public.project_checklists
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_checklists.card_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Users can view checklist items for accessible cards" ON public.project_checklist_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_checklists pcl
    JOIN public.project_cards pc ON pcl.card_id = pc.id
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pcl.id = project_checklist_items.checklist_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can manage checklist items" ON public.project_checklist_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.project_checklists pcl
    JOIN public.project_cards pc ON pcl.card_id = pc.id
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pcl.id = project_checklist_items.checklist_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Users can view activities for accessible cards" ON public.project_activities
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_activities.card_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

CREATE POLICY "Board members can create activities" ON public.project_activities
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.project_cards pc
    JOIN public.project_lists pl ON pc.list_id = pl.id
    JOIN public.project_boards pb ON pl.board_id = pb.id
    WHERE pc.id = project_activities.card_id
    AND (pb.user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.project_members WHERE board_id = pb.id AND user_id = auth.uid()))
  )
);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_project_boards_updated_at BEFORE UPDATE ON public.project_boards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_lists_updated_at BEFORE UPDATE ON public.project_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_cards_updated_at BEFORE UPDATE ON public.project_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_labels_updated_at BEFORE UPDATE ON public.project_labels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_members_updated_at BEFORE UPDATE ON public.project_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_checklists_updated_at BEFORE UPDATE ON public.project_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_checklist_items_updated_at BEFORE UPDATE ON public.project_checklist_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();