export type LeadStatus = 'novo' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido';

export interface Lead {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  fonte: string;
  status: LeadStatus;
  valor: number;
  probabilidade: number;
  dataContato: string;
  observacoes?: string;
  
  // Presença Digital
  site?: string;
  instagram?: string;
  facebook?: string;
  outrasRedesSociais?: string;
  
  // Faturamento
  faturamentoAtual?: number;
  faturamentoDesejado?: number;
  
  // Comportamento e Potencial
  doresIdentificadas?: string[];
  nivelConsciencia?: string;
  etapaJornada?: string;
  indicadorPotencial?: string;
  equipeAtual?: string;
}

export interface LeadAdvanced {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  fonte: string;
  status: 'frio' | 'morno' | 'quente';
  etapaFunil: 'descoberta' | 'consideracao' | 'decisao' | 'fechamento' | 'fidelizacao';
  valor: number;
  probabilidade: number;
  dataContato: string;
  observacoes?: string;
  
  // Campos do Mindset Comercial Poderalize
  travaEmocional: 'inseguranca_financeira' | 'medo_dar_errado' | 'falta_apoio' | 'falta_tempo' | 'desconfianca';
  tipoDiscurso: 'tecnico' | 'emocional' | 'inspirador';
  necessidadeOculta: string[];
  
  // Campos de Atração e Conversão
  anuncioOrigem?: string;
  produtoInteresse: string;
  ofertaAtrativa: string;
  gatilhosFuncionais: string[];
  
  // Lead Scoring
  pontuacao: number;
  ultimaInteracao: string;
  
  // Vendedor responsável
  vendedorId: string;
  vendedorNome: string;
}

export interface SalesMetrics {
  vendedorId: string;
  vendedorNome: string;
  leadsAtendidos: number;
  conversoes: number;
  taxaConversao: number;
  receitaGerada: number;
  tempoMedioFechamento: number;
  tipoAtendimento: 'escuta_ativa' | 'venda_consultiva' | 'venda_forcada';
  pontuacao: number;
  badges: string[];
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadNome: string;
  dataAgendada: string;
  tipo: 'ligacao' | 'whatsapp' | 'email' | 'reuniao';
  status: 'pendente' | 'concluido' | 'reagendado';
  observacoes?: string;
  templateMensagem?: string;
  vendedorId: string;
}

export interface FunnelStep {
  etapa: string;
  quantidade: number;
  conversao: number;
  tempoMedio: number;
  receita: number;
}

export interface RecomendacaoIA {
  leadId: string;
  tipo: 'acao' | 'alerta' | 'oportunidade';
  titulo: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta';
  sugestao: string;
}