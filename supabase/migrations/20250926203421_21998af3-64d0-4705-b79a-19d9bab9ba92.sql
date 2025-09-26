-- Create enums for lead management
CREATE TYPE public.lead_status_simple AS ENUM ('novo', 'qualificado', 'proposta', 'negociacao', 'fechado', 'perdido');
CREATE TYPE public.lead_status_advanced AS ENUM ('frio', 'morno', 'quente');
CREATE TYPE public.funnel_stage_type AS ENUM ('descoberta', 'consideracao', 'decisao', 'fechamento', 'fidelizacao');
CREATE TYPE public.trava_emocional_type AS ENUM ('inseguranca_financeira', 'medo_dar_errado', 'falta_apoio', 'falta_tempo', 'desconfianca');
CREATE TYPE public.tipo_discurso AS ENUM ('tecnico', 'emocional', 'inspirador');
CREATE TYPE public.follow_up_type AS ENUM ('ligacao', 'whatsapp', 'email', 'reuniao');
CREATE TYPE public.follow_up_status AS ENUM ('pendente', 'concluido', 'reagendado');

-- Create main leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  empresa TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  fonte TEXT NOT NULL,
  status_simple lead_status_simple DEFAULT 'novo',
  status_advanced lead_status_advanced DEFAULT 'frio',
  etapa_funil funnel_stage_type DEFAULT 'descoberta',
  valor NUMERIC DEFAULT 0,
  probabilidade INTEGER DEFAULT 0 CHECK (probabilidade >= 0 AND probabilidade <= 100),
  data_contato DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  
  -- Presença Digital
  site TEXT,
  instagram TEXT,
  facebook TEXT,
  outras_redes_sociais TEXT,
  
  -- Faturamento
  faturamento_atual NUMERIC,
  faturamento_desejado NUMERIC,
  
  -- Comportamento e Potencial
  dores_identificadas TEXT[],
  nivel_consciencia TEXT,
  etapa_jornada TEXT,
  indicador_potencial TEXT,
  equipe_atual TEXT,
  
  -- Campos do Mindset Comercial Poderalize
  trava_emocional trava_emocional_type,
  tipo_discurso tipo_discurso,
  necessidade_oculta TEXT[],
  
  -- Campos de Atração e Conversão
  anuncio_origem TEXT,
  produto_interesse TEXT NOT NULL DEFAULT 'Não especificado',
  oferta_atrativa TEXT,
  gatilhos_funcionais TEXT[],
  
  -- Lead Scoring
  pontuacao INTEGER DEFAULT 0,
  ultima_interacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Vendedor responsável
  vendedor_id UUID,
  vendedor_nome TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create funnels table for custom sales funnels
CREATE TABLE public.funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create funnel stages table
CREATE TABLE public.funnel_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create follow-ups table
CREATE TABLE public.follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  lead_nome TEXT NOT NULL,
  data_agendada TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo follow_up_type NOT NULL,
  status follow_up_status DEFAULT 'pendente',
  observacoes TEXT,
  template_mensagem TEXT,
  vendedor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create lead interactions table for tracking all interactions
CREATE TABLE public.lead_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  description TEXT NOT NULL,
  interaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by_user UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads table
CREATE POLICY "Users can view their own leads" ON public.leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" ON public.leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" ON public.leads
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for funnels table
CREATE POLICY "Users can view their own funnels" ON public.funnels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own funnels" ON public.funnels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funnels" ON public.funnels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own funnels" ON public.funnels
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for funnel_stages table
CREATE POLICY "Users can view funnel stages of their funnels" ON public.funnel_stages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.funnels 
    WHERE funnels.id = funnel_stages.funnel_id 
    AND funnels.user_id = auth.uid()
  ));

CREATE POLICY "Users can create funnel stages for their funnels" ON public.funnel_stages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.funnels 
    WHERE funnels.id = funnel_stages.funnel_id 
    AND funnels.user_id = auth.uid()
  ));

CREATE POLICY "Users can update funnel stages of their funnels" ON public.funnel_stages
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.funnels 
    WHERE funnels.id = funnel_stages.funnel_id 
    AND funnels.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete funnel stages of their funnels" ON public.funnel_stages
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.funnels 
    WHERE funnels.id = funnel_stages.funnel_id 
    AND funnels.user_id = auth.uid()
  ));

-- Create RLS policies for follow_ups table
CREATE POLICY "Users can view their own follow_ups" ON public.follow_ups
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own follow_ups" ON public.follow_ups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own follow_ups" ON public.follow_ups
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follow_ups" ON public.follow_ups
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for lead_interactions table
CREATE POLICY "Users can view interactions of their leads" ON public.lead_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create interactions for their leads" ON public.lead_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update interactions of their leads" ON public.lead_interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete interactions of their leads" ON public.lead_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funnels_updated_at
  BEFORE UPDATE ON public.funnels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funnel_stages_updated_at
  BEFORE UPDATE ON public.funnel_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_follow_ups_updated_at
  BEFORE UPDATE ON public.follow_ups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_status_simple ON public.leads(status_simple);
CREATE INDEX idx_leads_status_advanced ON public.leads(status_advanced);
CREATE INDEX idx_leads_etapa_funil ON public.leads(etapa_funil);
CREATE INDEX idx_leads_data_contato ON public.leads(data_contato);
CREATE INDEX idx_leads_vendedor_id ON public.leads(vendedor_id);

CREATE INDEX idx_funnels_user_id ON public.funnels(user_id);
CREATE INDEX idx_funnels_is_active ON public.funnels(is_active);

CREATE INDEX idx_funnel_stages_funnel_id ON public.funnel_stages(funnel_id);
CREATE INDEX idx_funnel_stages_position ON public.funnel_stages(position);

CREATE INDEX idx_follow_ups_user_id ON public.follow_ups(user_id);
CREATE INDEX idx_follow_ups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX idx_follow_ups_data_agendada ON public.follow_ups(data_agendada);
CREATE INDEX idx_follow_ups_status ON public.follow_ups(status);

CREATE INDEX idx_lead_interactions_user_id ON public.lead_interactions(user_id);
CREATE INDEX idx_lead_interactions_lead_id ON public.lead_interactions(lead_id);