-- Create enum for automation trigger types
CREATE TYPE automation_trigger_type AS ENUM (
  'card_moved',
  'card_created',
  'due_date',
  'member_assigned',
  'label_added'
);

-- Create enum for automation action types
CREATE TYPE automation_action_type AS ENUM (
  'move_card',
  'assign_member',
  'add_label',
  'create_card',
  'send_notification'
);

-- Create enum for recurrence frequency
CREATE TYPE recurrence_frequency AS ENUM (
  'daily',
  'weekly',
  'monthly'
);

-- Table for automation rules
CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.project_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type automation_trigger_type NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}',
  action_type automation_action_type NOT NULL,
  action_config JSONB NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for recurring cards
CREATE TABLE public.recurring_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.project_boards(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES public.project_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency recurrence_frequency NOT NULL,
  day_of_week INTEGER, -- 0-6 for weekly
  day_of_month INTEGER, -- 1-31 for monthly
  time_of_day TIME, -- HH:MM for daily/weekly/monthly
  last_created_at TIMESTAMP WITH TIME ZONE,
  next_creation_at TIMESTAMP WITH TIME ZONE NOT NULL,
  template_config JSONB NOT NULL DEFAULT '{}', -- labels, assignees, etc
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for scheduled cards
CREATE TABLE public.scheduled_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.project_boards(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES public.project_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  template_config JSONB NOT NULL DEFAULT '{}',
  executed BOOLEAN NOT NULL DEFAULT false,
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for custom board buttons
CREATE TABLE public.board_buttons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.project_boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  actions JSONB NOT NULL DEFAULT '[]', -- Array of action configs
  position INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for automation logs
CREATE TABLE public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES public.project_boards(id) ON DELETE CASCADE,
  automation_type TEXT NOT NULL, -- 'rule', 'recurring', 'scheduled', 'button'
  automation_id UUID NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'error'
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_automation_rules_board ON public.automation_rules(board_id);
CREATE INDEX idx_automation_rules_enabled ON public.automation_rules(enabled);
CREATE INDEX idx_recurring_cards_board ON public.recurring_cards(board_id);
CREATE INDEX idx_recurring_cards_next_creation ON public.recurring_cards(next_creation_at) WHERE enabled = true;
CREATE INDEX idx_scheduled_cards_board ON public.scheduled_cards(board_id);
CREATE INDEX idx_scheduled_cards_scheduled_for ON public.scheduled_cards(scheduled_for) WHERE executed = false;
CREATE INDEX idx_board_buttons_board ON public.board_buttons(board_id);
CREATE INDEX idx_automation_logs_board ON public.automation_logs(board_id);
CREATE INDEX idx_automation_logs_created ON public.automation_logs(created_at);

-- Enable RLS
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for automation_rules
CREATE POLICY "Users can view rules of accessible boards"
  ON public.automation_rules FOR SELECT
  USING (user_has_board_access(auth.uid(), board_id));

CREATE POLICY "Board members can manage rules"
  ON public.automation_rules FOR ALL
  USING (user_has_board_access(auth.uid(), board_id))
  WITH CHECK (user_has_board_access(auth.uid(), board_id));

-- RLS Policies for recurring_cards
CREATE POLICY "Users can view recurring cards of accessible boards"
  ON public.recurring_cards FOR SELECT
  USING (user_has_board_access(auth.uid(), board_id));

CREATE POLICY "Board members can manage recurring cards"
  ON public.recurring_cards FOR ALL
  USING (user_has_board_access(auth.uid(), board_id))
  WITH CHECK (user_has_board_access(auth.uid(), board_id));

-- RLS Policies for scheduled_cards
CREATE POLICY "Users can view scheduled cards of accessible boards"
  ON public.scheduled_cards FOR SELECT
  USING (user_has_board_access(auth.uid(), board_id));

CREATE POLICY "Board members can manage scheduled cards"
  ON public.scheduled_cards FOR ALL
  USING (user_has_board_access(auth.uid(), board_id))
  WITH CHECK (user_has_board_access(auth.uid(), board_id));

-- RLS Policies for board_buttons
CREATE POLICY "Users can view buttons of accessible boards"
  ON public.board_buttons FOR SELECT
  USING (user_has_board_access(auth.uid(), board_id));

CREATE POLICY "Board members can manage buttons"
  ON public.board_buttons FOR ALL
  USING (user_has_board_access(auth.uid(), board_id))
  WITH CHECK (user_has_board_access(auth.uid(), board_id));

-- RLS Policies for automation_logs
CREATE POLICY "Users can view logs of accessible boards"
  ON public.automation_logs FOR SELECT
  USING (user_has_board_access(auth.uid(), board_id));

CREATE POLICY "System can insert logs"
  ON public.automation_logs FOR INSERT
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_cards_updated_at
  BEFORE UPDATE ON public.recurring_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_cards_updated_at
  BEFORE UPDATE ON public.scheduled_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_board_buttons_updated_at
  BEFORE UPDATE ON public.board_buttons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();