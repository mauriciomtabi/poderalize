import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Eye, Edit2, Trash2, TrendingUp, Users, DollarSign, Target, Phone, Mail, Building, Calendar, FileText, Globe, Instagram, Facebook, Share, User, UserCheck } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useClientes } from '@/hooks/useClientes';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { toast } from 'sonner';
import { useLeads, type Lead, type CreateLeadData } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
const Leads = () => {
  // Use hooks
  const {
    leads,
    isLoading,
    addLead,
    updateLead,
    deleteLead,
    getLeadsPerdidos
  } = useLeads();
  const {
    user
  } = useAuth();

  // Hooks
  const { addCliente } = useClientes();

  // Estados dos modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [newLeadAvatarUrl, setNewLeadAvatarUrl] = useState<string | undefined>(undefined);

  // Estado de busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Estado do novo lead
  const [novoLead, setNovoLead] = useState<CreateLeadData>({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    fonte: '',
    status_simple: 'novo',
    valor: 0,
    probabilidade: 0,
    data_contato: new Date().toISOString().split('T')[0],
    observacoes: '',
    produto_interesse: '',
    // Presença Digital
    site: '',
    instagram: '',
    facebook: '',
    outras_redes_sociais: '',
    // Faturamento
    faturamento_atual: 0,
    faturamento_desejado: 0,
    // Comportamento e Potencial
    dores_identificadas: [],
    nivel_consciencia: '',
    etapa_jornada: '',
    indicador_potencial: '',
    equipe_atual: ''
  });

  // Opções para selects
  const statusOptions = [{
    value: 'novo',
    label: 'Novo'
  }, {
    value: 'qualificado',
    label: 'Qualificado'
  }, {
    value: 'proposta',
    label: 'Proposta'
  }, {
    value: 'negociacao',
    label: 'Negociação'
  }, {
    value: 'fechado',
    label: 'Fechado'
  }, {
    value: 'perdido',
    label: 'Perdido'
  }];
  const fonteOptions = ['Website', 'LinkedIn', 'Facebook', 'Instagram', 'Google Ads', 'Indicação', 'Evento', 'Cold Call', 'E-mail Marketing'];
  const doresOptions = ['Baixa visibilidade online', 'Poucas vendas', 'Dificuldade para gerar leads', 'Marca não reconhecida', 'Concorrência forte', 'Falta de estratégia digital', 'Equipe sem capacitação', 'Processos desorganizados'];
  const nivelConscienciaOptions = ['Inconsciente (não sabe que tem um problema)', 'Consciente do problema', 'Consciente da solução', 'Consciente do produto/serviço', 'Totalmente consciente (pronto para comprar)'];
  const etapaJornadaOptions = ['Descoberta', 'Consideração', 'Decisão', 'Fidelização'];
  const indicadorPotencialOptions = ['Lead com alto potencial (com verba, decisão e clareza)', 'Lead com médio potencial (interessado, mas travado)', 'Lead com baixo potencial (curioso, mas distante do perfil ideal)'];

  // Função para adicionar lead
  const handleAddLead = async () => {
    if (!novoLead.nome) {
      toast.error('Por favor, preencha o Nome do contato');
      return;
    }
    const success = await addLead({
      ...novoLead,
      avatar_url: newLeadAvatarUrl
    });
    if (success) {
      // Reset form
      setNovoLead({
        nome: '',
        empresa: '',
        email: '',
        telefone: '',
        fonte: '',
        status_simple: 'novo',
        valor: 0,
        probabilidade: 0,
        data_contato: new Date().toISOString().split('T')[0],
        observacoes: '',
        produto_interesse: '',
        // Presença Digital
        site: '',
        instagram: '',
        facebook: '',
        outras_redes_sociais: '',
        // Faturamento
        faturamento_atual: 0,
        faturamento_desejado: 0,
        // Comportamento e Potencial
        dores_identificadas: [],
        nivel_consciencia: '',
        etapa_jornada: '',
        indicador_potencial: '',
        equipe_atual: ''
      });
      setNewLeadAvatarUrl(undefined);
      setShowAddModal(false);
    }
  };

  // Função para obter configuração de status
  const getStatusConfig = (status?: string) => {
    const configs = {
      'novo': {
        color: 'bg-blue-100 text-blue-800',
        label: 'Novo'
      },
      'qualificado': {
        color: 'bg-yellow-100 text-yellow-800',
        label: 'Qualificado'
      },
      'proposta': {
        color: 'bg-purple-100 text-purple-800',
        label: 'Proposta'
      },
      'negociacao': {
        color: 'bg-orange-100 text-orange-800',
        label: 'Negociação'
      },
      'fechado': {
        color: 'bg-green-100 text-green-800',
        label: 'Fechado'
      },
      'perdido': {
        color: 'bg-red-100 text-red-800',
        label: 'Perdido'
      }
    };
    return configs[status as keyof typeof configs] || configs['novo'];
  };

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para calcular valor total
  const totalValue = leads.reduce((sum, lead) => sum + (lead.valor || 0), 0);

  // Função para calcular valor ponderado
  const weightedValue = leads.reduce((sum, lead) => {
    return sum + (lead.valor || 0) * (lead.probabilidade || 0) / 100;
  }, 0);

  // Função para abrir modal de visualização
  const handleCardClick = (lead: Lead) => {
    setSelectedLead(lead);
    setEditedLead({
      ...lead
    });
    setShowViewModal(true);
    setIsEditing(false);
  };

  // Funções de edição
  const handleEdit = () => {
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedLead(selectedLead ? {
      ...selectedLead
    } : null);
  };

  // Função para salvar edição
  const handleSaveEdit = async () => {
    if (!editedLead || !selectedLead) return;
    const success = await updateLead(selectedLead.id, editedLead);
    if (success) {
      setIsEditing(false);
      setSelectedLead(success);
    }
  };

  // Função para deletar lead
  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    const success = await deleteLead(leadToDelete.id);
    if (success) {
      setShowDeleteModal(false);
      setLeadToDelete(null);
      setShowViewModal(false);
    }
  };

  // Função para promover lead a cliente
  const handlePromoteToClient = async () => {
    if (!selectedLead) return;

    try {
      // Criar cliente com dados do lead
      const clienteData = {
        nome: selectedLead.nome,
        empresa: selectedLead.empresa,
        email: selectedLead.email,
        telefone: selectedLead.telefone || undefined,
        valor_fechamento: selectedLead.valor || 0,
        data_fechamento: new Date().toISOString().split('T')[0],
        observacoes: selectedLead.observacoes || undefined,
        site: selectedLead.site || undefined,
        instagram: selectedLead.instagram || undefined,
        facebook: selectedLead.facebook || undefined,
        outras_redes_sociais: selectedLead.outras_redes_sociais || undefined,
        faturamento_atual: selectedLead.faturamento_atual || undefined,
        faturamento_desejado: selectedLead.faturamento_desejado || undefined,
        nivel_consciencia: selectedLead.nivel_consciencia || undefined,
        etapa_jornada: selectedLead.etapa_jornada || undefined,
        indicador_potencial: selectedLead.indicador_potencial || undefined,
        equipe_atual: selectedLead.equipe_atual || undefined,
        avatar_url: selectedLead.avatar_url || undefined,
        fonte_original: selectedLead.fonte,
        vendedor_id: selectedLead.vendedor_id || undefined,
        vendedor_nome: selectedLead.vendedor_nome || undefined,
        lead_id: selectedLead.id,
      };

      const success = await addCliente(clienteData);
      
      if (success) {
        // Deletar o lead após criar o cliente
        await deleteLead(selectedLead.id);
        
        toast.success('Lead promovido a cliente', {
          description: `${selectedLead.nome} agora é um cliente!`,
        });
        
        setShowPromoteModal(false);
        setShowViewModal(false);
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Erro ao promover lead:', error);
      toast.error('Erro ao promover lead', {
        description: 'Não foi possível promover o lead a cliente.',
      });
    }
  };

  // Filtrar leads com base na busca e status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lead.empresa.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         lead.fonte.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'perdidos' && lead.status_simple === 'perdido') ||
                         (statusFilter !== 'perdidos' && lead.status_simple === statusFilter);
    
    return matchesSearch && matchesStatus;
  });

  // Calcular métricas dos leads perdidos
  const leadsPerdidos = getLeadsPerdidos();
  const motivosPerda = leadsPerdidos.reduce((acc, lead) => {
    if (lead.motivo_perda) {
      acc[lead.motivo_perda] = (acc[lead.motivo_perda] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Show loading if not authenticated
  if (!user) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Você precisa estar logado para acessar os leads</p>
        </div>
      </div>;
  }

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>;
  }
  return <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          
          
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total de Leads</p>
              <p className="text-2xl font-bold">{leads.length}</p>
            </div>
            <div className="p-3 rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Valor Total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            </div>
            <div className="p-3 rounded-full bg-muted">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Taxa Conversão</p>
              <p className="text-2xl font-bold">
                {leads.length > 0 ? Math.round(leads.filter(l => l.status_simple === 'fechado').length / leads.length * 100) : 0}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-muted">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Buscar leads..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="min-w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Leads</SelectItem>
              <SelectItem value="novo">Novos</SelectItem>
              <SelectItem value="qualificado">Qualificados</SelectItem>
              <SelectItem value="proposta">Proposta</SelectItem>
              <SelectItem value="negociacao">Negociação</SelectItem>
              <SelectItem value="fechado">Fechados</SelectItem>
              <SelectItem value="perdidos">
                🔍 Leads Perdidos {leadsPerdidos.length > 0 && `(${leadsPerdidos.length})`}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastro de Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex justify-center py-4">
                <AvatarUpload
                  currentAvatarUrl={newLeadAvatarUrl}
                  onAvatarChange={(url) => setNewLeadAvatarUrl(url || undefined)}
                  fallbackText={novoLead.nome ? novoLead.nome.substring(0, 2).toUpperCase() : "LE"}
                />
              </div>

              {/* Dados Básicos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados Básicos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input id="nome" value={novoLead.nome} onChange={e => setNovoLead({
                    ...novoLead,
                    nome: e.target.value
                  })} placeholder="Nome do contato" />
                  </div>
                  <div>
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input id="empresa" value={novoLead.empresa} onChange={e => setNovoLead({
                    ...novoLead,
                    empresa: e.target.value
                  })} placeholder="Nome da empresa" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" value={novoLead.email} onChange={e => setNovoLead({
                    ...novoLead,
                    email: e.target.value
                  })} placeholder="email@empresa.com" />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" value={novoLead.telefone} onChange={e => setNovoLead({
                    ...novoLead,
                    telefone: e.target.value
                  })} placeholder="(11) 99999-9999" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fonte">Fonte</Label>
                    <Select value={novoLead.fonte} onValueChange={value => setNovoLead({
                    ...novoLead,
                    fonte: value
                  })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a fonte" />
                      </SelectTrigger>
                      <SelectContent>
                        {fonteOptions.map(fonte => <SelectItem key={fonte} value={fonte}>{fonte}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={novoLead.status_simple} onValueChange={(value: any) => setNovoLead({
                    ...novoLead,
                    status_simple: value
                  })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input id="valor" type="number" value={novoLead.valor} onChange={e => setNovoLead({
                    ...novoLead,
                    valor: parseFloat(e.target.value) || 0
                  })} placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="probabilidade">Probabilidade (%)</Label>
                    <Input id="probabilidade" type="number" value={novoLead.probabilidade} onChange={e => setNovoLead({
                    ...novoLead,
                    probabilidade: parseInt(e.target.value) || 0
                  })} placeholder="0" min="0" max="100" />
                  </div>
                  <div>
                    <Label htmlFor="dataContato">Data de Contato</Label>
                    <Input id="dataContato" type="date" value={novoLead.data_contato} onChange={e => setNovoLead({
                    ...novoLead,
                    data_contato: e.target.value
                  })} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="produtoInteresse">Produto de Interesse</Label>
                  <Input id="produtoInteresse" value={novoLead.produto_interesse} onChange={e => setNovoLead({
                  ...novoLead,
                  produto_interesse: e.target.value
                })} placeholder="Qual produto/serviço tem interesse?" />
                </div>
              </div>

              {/* Presença Digital */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Presença Digital</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="site">Site</Label>
                    <Input id="site" value={novoLead.site} onChange={e => setNovoLead({
                    ...novoLead,
                    site: e.target.value
                  })} placeholder="https://empresa.com.br" />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input id="instagram" value={novoLead.instagram} onChange={e => setNovoLead({
                    ...novoLead,
                    instagram: e.target.value
                  })} placeholder="@empresa" />
                  </div>
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input id="facebook" value={novoLead.facebook} onChange={e => setNovoLead({
                    ...novoLead,
                    facebook: e.target.value
                  })} placeholder="/empresa" />
                  </div>
                  <div>
                    <Label htmlFor="outrasRedes">Outras Redes</Label>
                    <Input id="outrasRedes" value={novoLead.outras_redes_sociais} onChange={e => setNovoLead({
                    ...novoLead,
                    outras_redes_sociais: e.target.value
                  })} placeholder="LinkedIn, TikTok, etc." />
                  </div>
                </div>
              </div>

              {/* Faturamento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Faturamento</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="faturamentoAtual">Faturamento Atual (R$)</Label>
                    <Input id="faturamentoAtual" type="number" value={novoLead.faturamento_atual} onChange={e => setNovoLead({
                    ...novoLead,
                    faturamento_atual: parseFloat(e.target.value) || 0
                  })} placeholder="10000" />
                  </div>
                  <div>
                    <Label htmlFor="faturamentoDesejado">Faturamento Desejado (R$)</Label>
                    <Input id="faturamentoDesejado" type="number" value={novoLead.faturamento_desejado} onChange={e => setNovoLead({
                    ...novoLead,
                    faturamento_desejado: parseFloat(e.target.value) || 0
                  })} placeholder="50000" />
                  </div>
                </div>
              </div>

              {/* Comportamento e Potencial */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Comportamento e Potencial</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nivelConsciencia">Nível de Consciência</Label>
                    <Select value={novoLead.nivel_consciencia} onValueChange={value => setNovoLead({
                    ...novoLead,
                    nivel_consciencia: value
                  })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        {nivelConscienciaOptions.map(opcao => <SelectItem key={opcao} value={opcao}>{opcao}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="etapaJornada">Etapa da Jornada</Label>
                    <Select value={novoLead.etapa_jornada} onValueChange={value => setNovoLead({
                    ...novoLead,
                    etapa_jornada: value
                  })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a etapa" />
                      </SelectTrigger>
                      <SelectContent>
                        {etapaJornadaOptions.map(etapa => <SelectItem key={etapa} value={etapa}>{etapa}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="indicadorPotencial">Indicador de Potencial</Label>
                    <Select value={novoLead.indicador_potencial} onValueChange={value => setNovoLead({
                    ...novoLead,
                    indicador_potencial: value
                  })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o potencial" />
                      </SelectTrigger>
                      <SelectContent>
                        {indicadorPotencialOptions.map(indicador => <SelectItem key={indicador} value={indicador}>{indicador}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="equipeAtual">Equipe Atual</Label>
                    <Input id="equipeAtual" value={novoLead.equipe_atual} onChange={e => setNovoLead({
                    ...novoLead,
                    equipe_atual: e.target.value
                  })} placeholder="Descreva a equipe atual" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" value={novoLead.observacoes} onChange={e => setNovoLead({
                  ...novoLead,
                  observacoes: e.target.value
                })} placeholder="Observações sobre o lead" rows={3} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddLead}>
                  Adicionar Lead
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de leads */}
      {statusFilter === 'perdidos' && leadsPerdidos.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">📊 Análise de Leads Perdidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                <strong>Total de leads perdidos:</strong> {leadsPerdidos.length}
              </p>
              {Object.keys(motivosPerda).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Principais motivos de perda:</p>
                  <div className="space-y-1">
                    {Object.entries(motivosPerda)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([motivo, count]) => (
                        <div key={motivo} className="flex justify-between items-center text-sm">
                          <span className="truncate">{motivo}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Nenhum lead encontrado' : 'Nenhum lead ainda'}
            </h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {searchTerm ? 'Tente ajustar os termos de busca para encontrar leads.' : 'Comece adicionando seus primeiros leads para gerenciar suas oportunidades.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredLeads.map(lead => (
            <Card 
              key={lead.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow p-6 landscape:p-3" 
              onClick={() => handleCardClick(lead)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={lead.avatar_url} alt={lead.nome} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{lead.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground truncate">{lead.empresa}</p>
                  </div>
                  <Badge className={`${getStatusConfig(lead.status_simple).color} flex-shrink-0`}>
                    {getStatusConfig(lead.status_simple).label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{lead.email}</span>
                </div>
                
                {lead.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{lead.telefone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{lead.fonte}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-green-600">
                    {formatCurrency(lead.valor || 0)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{lead.probabilidade || 0}% probabilidade</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(lead.data_contato).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {lead.status_simple === 'perdido' && lead.motivo_perda && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs font-medium text-red-800">Motivo da Perda:</p>
                    <p className="text-xs text-red-700 truncate">{lead.motivo_perda}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de visualização/edição */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>
                {isEditing ? 'Editar Lead' : 'Detalhes do Lead'}
              </DialogTitle>
              <div className="flex gap-2">
                {!isEditing ? <>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => setShowPromoteModal(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Promover a Cliente
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setLeadToDelete(selectedLead)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o lead "{selectedLead?.nome}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteLead}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </> : <>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      Salvar
                    </Button>
                  </>}
              </div>
            </div>
          </DialogHeader>
          
          {selectedLead && <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Avatar Section */}
              {!isEditing && (
                <div className="flex justify-center pb-4 border-b">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedLead.avatar_url} alt={selectedLead.nome} />
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              {/* Avatar Upload in Edit Mode */}
              {isEditing && (
                <div className="flex justify-center pb-4">
                  <AvatarUpload
                    currentAvatarUrl={editedLead?.avatar_url}
                    onAvatarChange={(url) => setEditedLead(prev => prev ? {...prev, avatar_url: url || undefined} : null)}
                    fallbackText={editedLead?.nome ? editedLead.nome.substring(0, 2).toUpperCase() : "LE"}
                  />
                </div>
              )}

              {/* Dados Básicos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">DADOS BÁSICOS</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome</Label>
                    {isEditing ? <Input value={editedLead?.nome || ''} onChange={e => setEditedLead(prev => prev ? {
                  ...prev,
                  nome: e.target.value
                } : null)} placeholder="Nome do contato" /> : <p className="p-2 bg-muted rounded-md">{selectedLead.nome}</p>}
                  </div>
                  <div>
                    <Label>Empresa</Label>
                    {isEditing ? <Input value={editedLead?.empresa || ''} onChange={e => setEditedLead(prev => prev ? {
                  ...prev,
                  empresa: e.target.value
                } : null)} placeholder="Nome da empresa" /> : <p className="p-2 bg-muted rounded-md">{selectedLead.empresa}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>E-mail</Label>
                    {isEditing ? <Input type="email" value={editedLead?.email || ''} onChange={e => setEditedLead(prev => prev ? {
                  ...prev,
                  email: e.target.value
                } : null)} placeholder="email@empresa.com" /> : <p className="p-2 bg-muted rounded-md">{selectedLead.email}</p>}
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    {isEditing ? <Input value={editedLead?.telefone || ''} onChange={e => setEditedLead(prev => prev ? {
                  ...prev,
                  telefone: e.target.value
                } : null)} placeholder="(11) 99999-9999" /> : <p className="p-2 bg-muted rounded-md">{selectedLead.telefone || 'Não informado'}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Fonte</Label>
                    {isEditing ? <Select value={editedLead?.fonte || ''} onValueChange={value => setEditedLead(prev => prev ? {
                  ...prev,
                  fonte: value
                } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Como nos conheceu?" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Website', 'Instagram', 'Facebook', 'LinkedIn', 'Google Ads', 'Indicação', 'WhatsApp', 'E-mail marketing', 'Evento', 'Outro'].map(fonte => <SelectItem key={fonte} value={fonte}>
                              {fonte}
                            </SelectItem>)}
                        </SelectContent>
                      </Select> : <p className="p-2 bg-muted rounded-md">{selectedLead.fonte}</p>}
                  </div>
                  <div>
                    <Label>Valor (R$)</Label>
                    {isEditing ? <Input type="number" value={editedLead?.valor || 0} onChange={e => setEditedLead(prev => prev ? {
                  ...prev,
                  valor: Number(e.target.value)
                } : null)} placeholder="50000" /> : <p className="p-2 bg-muted rounded-md">R$ {selectedLead.valor?.toLocaleString('pt-BR') || '0'}</p>}
                  </div>
                  <div>
                    <Label>Probabilidade (%)</Label>
                    {isEditing ? <Input type="number" min="0" max="100" value={editedLead?.probabilidade || 0} onChange={e => setEditedLead(prev => prev ? {
                  ...prev,
                  probabilidade: Number(e.target.value)
                } : null)} placeholder="50" /> : <p className="p-2 bg-muted rounded-md">{selectedLead.probabilidade || 0}%</p>}
                  </div>
                </div>

                <div>
                  <Label>Produto de Interesse</Label>
                  {isEditing ? <Input value={editedLead?.produto_interesse || ''} onChange={e => setEditedLead(prev => prev ? {
                ...prev,
                produto_interesse: e.target.value
              } : null)} placeholder="Produto ou serviço de interesse" /> : <p className="p-2 bg-muted rounded-md">{selectedLead.produto_interesse || 'Não especificado'}</p>}
                </div>
              </div>

              {/* Presença Digital */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">PRESENÇA DIGITAL</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Site</Label>
                    {isEditing ? <Input value={editedLead?.site || ''} onChange={e => setEditedLead(prev => prev ? {
                  ...prev,
                  site: e.target.value
                } : null)} placeholder="www.empresa.com.br" /> : <p className="p-2 bg-muted rounded-md">{selectedLead.site || 'Não informado'}</p>}
                  </div>
                  <div>
                    <Label>Instagram</Label>
                    {isEditing ? <Input value={editedLead?.instagram || ''} onChange={e => setEditedLead(prev => prev ? {
                  ...prev,
                  instagram: e.target.value
                } : null)} placeholder="@empresa" /> : <p className="p-2 bg-muted rounded-md">{selectedLead.instagram || 'Não informado'}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Facebook</Label>
                    {isEditing ? <Input value={editedLead?.facebook || ''} onChange={e => setEditedLead(prev => prev ? {
                  ...prev,
                  facebook: e.target.value
                } : null)} placeholder="facebook.com/empresa" /> : <p className="p-2 bg-muted rounded-md">{selectedLead.facebook || 'Não informado'}</p>}
                  </div>
                  <div>
                    <Label>Outras Redes Sociais</Label>
                    {isEditing ? <Input value={editedLead?.outras_redes_sociais || ''} onChange={e => setEditedLead(prev => prev ? {
                  ...prev,
                  outras_redes_sociais: e.target.value
                } : null)} placeholder="LinkedIn, TikTok, YouTube..." /> : <p className="p-2 bg-muted rounded-md">{selectedLead.outras_redes_sociais || 'Não informado'}</p>}
                  </div>
                </div>
              </div>

              {/* Faturamento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">FATURAMENTO</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Faturamento Mensal Atual</Label>
                    {isEditing ? <Input type="number" value={editedLead?.faturamento_atual || ''} onChange={e => setEditedLead(prev => prev ? {
                  ...prev,
                  faturamento_atual: Number(e.target.value)
                } : null)} placeholder="50000" /> : <p className="p-2 bg-muted rounded-md">
                        {selectedLead.faturamento_atual ? `R$ ${Number(selectedLead.faturamento_atual).toLocaleString('pt-BR')}` : 'Não informado'}
                      </p>}
                  </div>
                  <div>
                    <Label>Faturamento Mensal Desejado</Label>
                    {isEditing ? <Input type="number" value={editedLead?.faturamento_desejado || ''} onChange={e => setEditedLead(prev => prev ? {
                  ...prev,
                  faturamento_desejado: Number(e.target.value)
                } : null)} placeholder="100000" /> : <p className="p-2 bg-muted rounded-md">
                        {selectedLead.faturamento_desejado ? `R$ ${Number(selectedLead.faturamento_desejado).toLocaleString('pt-BR')}` : 'Não informado'}
                      </p>}
                  </div>
                </div>
              </div>

              {/* Comportamento e Potencial */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">COMPORTAMENTO E POTENCIAL</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Dores Identificadas</Label>
                    {isEditing ? <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                        {['Falta de clientes', 'Baixo faturamento', 'Dificuldade para vender', 'Sem estratégia de marketing', 'Equipe desmotivada', 'Processos desorganizados', 'Concorrência acirrada', 'Falta de diferenciação'].map(dor => <label key={dor} className="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" checked={editedLead?.dores_identificadas?.includes(dor) || false} onChange={e => {
                      const dores = editedLead?.dores_identificadas || [];
                      if (e.target.checked) {
                        setEditedLead(prev => prev ? {
                          ...prev,
                          dores_identificadas: [...dores, dor]
                        } : null);
                      } else {
                        setEditedLead(prev => prev ? {
                          ...prev,
                          dores_identificadas: dores.filter(d => d !== dor)
                        } : null);
                      }
                    }} className="rounded" />
                            <span className="text-sm">{dor}</span>
                          </label>)}
                      </div> : <div className="p-2 bg-muted rounded-md min-h-[100px]">
                        {selectedLead.dores_identificadas && selectedLead.dores_identificadas.length > 0 ? <ul className="list-disc list-inside space-y-1">
                            {selectedLead.dores_identificadas.map((dor, index) => <li key={index} className="text-sm">{dor}</li>)}
                          </ul> : <p className="text-muted-foreground">Nenhuma dor identificada</p>}
                      </div>}
                  </div>
                  
                  <div>
                    <Label>Nível de Consciência</Label>
                    {isEditing ? <Select value={editedLead?.nivel_consciencia || ''} onValueChange={value => setEditedLead(prev => prev ? {
                  ...prev,
                  nivel_consciencia: value
                } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'].map(nivel => <SelectItem key={nivel} value={nivel}>
                              {nivel}
                            </SelectItem>)}
                        </SelectContent>
                      </Select> : <p className="p-2 bg-muted rounded-md">{selectedLead.nivel_consciencia || 'Não informado'}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Etapa da Jornada</Label>
                    {isEditing ? <Select value={editedLead?.etapa_jornada || ''} onValueChange={value => setEditedLead(prev => prev ? {
                  ...prev,
                  etapa_jornada: value
                } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Descoberta', 'Consideração', 'Decisão', 'Pós-venda'].map(etapa => <SelectItem key={etapa} value={etapa}>
                              {etapa}
                            </SelectItem>)}
                        </SelectContent>
                      </Select> : <p className="p-2 bg-muted rounded-md">{selectedLead.etapa_jornada || 'Não informado'}</p>}
                  </div>
                  
                  <div>
                    <Label>Indicador de Potencial</Label>
                    {isEditing ? <Select value={editedLead?.indicador_potencial || ''} onValueChange={value => setEditedLead(prev => prev ? {
                  ...prev,
                  indicador_potencial: value
                } : null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {['Baixo', 'Médio', 'Alto', 'Muito Alto'].map(indicador => <SelectItem key={indicador} value={indicador}>
                              {indicador}
                            </SelectItem>)}
                        </SelectContent>
                      </Select> : <p className="p-2 bg-muted rounded-md">{selectedLead.indicador_potencial || 'Não informado'}</p>}
                  </div>
                </div>

                <div>
                  <Label>Equipe Atual</Label>
                  {isEditing ? <Input value={editedLead?.equipe_atual || ''} onChange={e => setEditedLead(prev => prev ? {
                ...prev,
                equipe_atual: e.target.value
              } : null)} placeholder="Exemplo: 3 colaboradores fixos e 2 freelancers" /> : <p className="p-2 bg-muted rounded-md">{selectedLead.equipe_atual || 'Não informado'}</p>}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">OBSERVAÇÕES</h3>
                <div>
                  <Label>Observações Gerais</Label>
                  {isEditing ? <Textarea value={editedLead?.observacoes || ''} onChange={e => setEditedLead(prev => prev ? {
                ...prev,
                observacoes: e.target.value
              } : null)} placeholder="Detalhes sobre o lead..." rows={4} /> : <div className="p-2 bg-muted rounded-md min-h-[100px]">
                      {selectedLead.observacoes ? <p className="whitespace-pre-wrap">{selectedLead.observacoes}</p> : <p className="text-muted-foreground">Nenhuma observação</p>}
                    </div>}
                </div>
              </div>

              {/* Informações do Sistema */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">INFORMAÇÕES DO SISTEMA</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data de Contato</Label>
                    <p className="p-2 bg-muted rounded-md">
                      {selectedLead.data_contato ? new Date(selectedLead.data_contato).toLocaleDateString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <Label>Última Interação</Label>
                    <p className="p-2 bg-muted rounded-md">
                      {selectedLead.ultima_interacao ? new Date(selectedLead.ultima_interacao).toLocaleString('pt-BR') : 'Não informado'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pontuação</Label>
                    <p className="p-2 bg-muted rounded-md">{selectedLead.pontuacao || 0} pontos</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p className="p-2 bg-muted rounded-md">
                      <Badge variant={selectedLead.status_simple === 'novo' ? 'default' : selectedLead.status_simple === 'qualificado' ? 'secondary' : selectedLead.status_simple === 'proposta' ? 'outline' : selectedLead.status_simple === 'negociacao' ? 'secondary' : selectedLead.status_simple === 'fechado' ? 'default' : 'outline'}>
                        {selectedLead.status_simple || 'novo'}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para promover a cliente */}
      <AlertDialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promover Lead a Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja promover "{selectedLead?.nome}" a cliente? 
              O lead será movido da página de Leads para a página de Clientes.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePromoteToClient}
              className="bg-green-600 hover:bg-green-700"
            >
              Sim, Promover a Cliente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default Leads;