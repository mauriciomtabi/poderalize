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
import { Plus, Search, Eye, Edit2, Trash2, TrendingUp, Users, DollarSign, Target, Phone, Mail, Building, Calendar, FileText, Globe, Instagram, Facebook, Share } from 'lucide-react';
import { toast } from 'sonner';
import { useLeads, type Lead, type CreateLeadData } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Leads = () => {
  // Use hooks
  const { leads, isLoading, addLead, updateLead, deleteLead } = useLeads();
  const { user } = useAuth();

  // Estados dos modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | null>(null);

  // Estado de busca
  const [searchTerm, setSearchTerm] = useState('');

  // Show loading if not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Você precisa estar logado para acessar os leads</p>
        </div>
      </div>
    );
  }

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
  const statusOptions = [
    { value: 'novo', label: 'Novo' },
    { value: 'qualificado', label: 'Qualificado' },
    { value: 'proposta', label: 'Proposta' },
    { value: 'negociacao', label: 'Negociação' },
    { value: 'fechado', label: 'Fechado' },
    { value: 'perdido', label: 'Perdido' }
  ];

  const fonteOptions = [
    'Website',
    'LinkedIn',
    'Facebook',
    'Instagram',
    'Google Ads',
    'Indicação',
    'Evento',
    'Cold Call',
    'E-mail Marketing'
  ];

  const doresOptions = [
    'Baixa visibilidade online',
    'Poucas vendas',
    'Dificuldade para gerar leads',
    'Marca não reconhecida',
    'Concorrência forte',
    'Falta de estratégia digital',
    'Equipe sem capacitação',
    'Processos desorganizados'
  ];

  const nivelConscienciaOptions = [
    'Inconsciente (não sabe que tem um problema)',
    'Consciente do problema',
    'Consciente da solução',
    'Consciente do produto/serviço',
    'Totalmente consciente (pronto para comprar)'
  ];

  const etapaJornadaOptions = [
    'Descoberta',
    'Consideração',
    'Decisão',
    'Fidelização'
  ];

  const indicadorPotencialOptions = [
    'Lead com alto potencial (com verba, decisão e clareza)',
    'Lead com médio potencial (interessado, mas travado)',
    'Lead com baixo potencial (curioso, mas distante do perfil ideal)'
  ];

  // Função para adicionar lead
  const handleAddLead = async () => {
    if (!novoLead.nome || !novoLead.empresa || !novoLead.email || !novoLead.fonte) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const success = await addLead(novoLead);
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
      
      setShowAddModal(false);
    }
  };

  // Função para obter configuração de status
  const getStatusConfig = (status?: string) => {
    const configs = {
      'novo': { color: 'bg-blue-100 text-blue-800', label: 'Novo' },
      'qualificado': { color: 'bg-yellow-100 text-yellow-800', label: 'Qualificado' },
      'proposta': { color: 'bg-purple-100 text-purple-800', label: 'Proposta' },
      'negociacao': { color: 'bg-orange-100 text-orange-800', label: 'Negociação' },
      'fechado': { color: 'bg-green-100 text-green-800', label: 'Fechado' },
      'perdido': { color: 'bg-red-100 text-red-800', label: 'Perdido' }
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
    setEditedLead({ ...lead });
    setShowViewModal(true);
    setIsEditing(false);
  };

  // Funções de edição
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedLead(selectedLead ? { ...selectedLead } : null);
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

  // Filtrar leads com base na busca
  const filteredLeads = leads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.fonte.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Ponderado</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(weightedValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.length > 0 ? Math.round((leads.filter(l => l.status_simple === 'fechado').length / leads.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header com busca e botão de adicionar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastro de Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Dados Básicos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados Básicos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={novoLead.nome}
                      onChange={(e) => setNovoLead({...novoLead, nome: e.target.value})}
                      placeholder="Nome do contato"
                    />
                  </div>
                  <div>
                    <Label htmlFor="empresa">Empresa *</Label>
                    <Input
                      id="empresa"
                      value={novoLead.empresa}
                      onChange={(e) => setNovoLead({...novoLead, empresa: e.target.value})}
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={novoLead.email}
                      onChange={(e) => setNovoLead({...novoLead, email: e.target.value})}
                      placeholder="email@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={novoLead.telefone}
                      onChange={(e) => setNovoLead({...novoLead, telefone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fonte">Fonte *</Label>
                    <Select
                      value={novoLead.fonte}
                      onValueChange={(value) => setNovoLead({...novoLead, fonte: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a fonte" />
                      </SelectTrigger>
                      <SelectContent>
                        {fonteOptions.map(fonte => (
                          <SelectItem key={fonte} value={fonte}>{fonte}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={novoLead.status_simple}
                      onValueChange={(value: any) => setNovoLead({...novoLead, status_simple: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="valor">Valor (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      value={novoLead.valor}
                      onChange={(e) => setNovoLead({...novoLead, valor: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="probabilidade">Probabilidade (%)</Label>
                    <Input
                      id="probabilidade"
                      type="number"
                      value={novoLead.probabilidade}
                      onChange={(e) => setNovoLead({...novoLead, probabilidade: parseInt(e.target.value) || 0})}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dataContato">Data de Contato</Label>
                    <Input
                      id="dataContato"
                      type="date"
                      value={novoLead.data_contato}
                      onChange={(e) => setNovoLead({...novoLead, data_contato: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="produtoInteresse">Produto de Interesse</Label>
                  <Input
                    id="produtoInteresse"
                    value={novoLead.produto_interesse}
                    onChange={(e) => setNovoLead({...novoLead, produto_interesse: e.target.value})}
                    placeholder="Qual produto/serviço tem interesse?"
                  />
                </div>
              </div>

              {/* Presença Digital */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Presença Digital</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="site">Site</Label>
                    <Input
                      id="site"
                      value={novoLead.site}
                      onChange={(e) => setNovoLead({...novoLead, site: e.target.value})}
                      placeholder="https://empresa.com.br"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={novoLead.instagram}
                      onChange={(e) => setNovoLead({...novoLead, instagram: e.target.value})}
                      placeholder="@empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={novoLead.facebook}
                      onChange={(e) => setNovoLead({...novoLead, facebook: e.target.value})}
                      placeholder="/empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="outrasRedes">Outras Redes</Label>
                    <Input
                      id="outrasRedes"
                      value={novoLead.outras_redes_sociais}
                      onChange={(e) => setNovoLead({...novoLead, outras_redes_sociais: e.target.value})}
                      placeholder="LinkedIn, TikTok, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Faturamento */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Faturamento</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="faturamentoAtual">Faturamento Atual (R$)</Label>
                    <Input
                      id="faturamentoAtual"
                      type="number"
                      value={novoLead.faturamento_atual}
                      onChange={(e) => setNovoLead({...novoLead, faturamento_atual: parseFloat(e.target.value) || 0})}
                      placeholder="10000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="faturamentoDesejado">Faturamento Desejado (R$)</Label>
                    <Input
                      id="faturamentoDesejado"
                      type="number"
                      value={novoLead.faturamento_desejado}
                      onChange={(e) => setNovoLead({...novoLead, faturamento_desejado: parseFloat(e.target.value) || 0})}
                      placeholder="50000"
                    />
                  </div>
                </div>
              </div>

              {/* Comportamento e Potencial */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Comportamento e Potencial</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nivelConsciencia">Nível de Consciência</Label>
                    <Select
                      value={novoLead.nivel_consciencia}
                      onValueChange={(value) => setNovoLead({...novoLead, nivel_consciencia: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        {nivelConscienciaOptions.map(opcao => (
                          <SelectItem key={opcao} value={opcao}>{opcao}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="etapaJornada">Etapa da Jornada</Label>
                    <Select
                      value={novoLead.etapa_jornada}
                      onValueChange={(value) => setNovoLead({...novoLead, etapa_jornada: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a etapa" />
                      </SelectTrigger>
                      <SelectContent>
                        {etapaJornadaOptions.map(etapa => (
                          <SelectItem key={etapa} value={etapa}>{etapa}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="indicadorPotencial">Indicador de Potencial</Label>
                    <Select
                      value={novoLead.indicador_potencial}
                      onValueChange={(value) => setNovoLead({...novoLead, indicador_potencial: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o potencial" />
                      </SelectTrigger>
                      <SelectContent>
                        {indicadorPotencialOptions.map(indicador => (
                          <SelectItem key={indicador} value={indicador}>{indicador}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="equipeAtual">Equipe Atual</Label>
                    <Input
                      id="equipeAtual"
                      value={novoLead.equipe_atual}
                      onChange={(e) => setNovoLead({...novoLead, equipe_atual: e.target.value})}
                      placeholder="Descreva a equipe atual"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={novoLead.observacoes}
                    onChange={(e) => setNovoLead({...novoLead, observacoes: e.target.value})}
                    placeholder="Observações sobre o lead"
                    rows={3}
                  />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum lead encontrado para sua busca' : 'Nenhum lead cadastrado'}
            </p>
          </div>
        ) : (
          filteredLeads.map((lead) => (
            <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCardClick(lead)}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{lead.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">{lead.empresa}</p>
                  </div>
                  <Badge className={getStatusConfig(lead.status_simple).color}>
                    {getStatusConfig(lead.status_simple).label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.email}</span>
                </div>
                {lead.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.telefone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{lead.fonte}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-sm font-semibold">{formatCurrency(lead.valor || 0)}</p>
                    <p className="text-xs text-muted-foreground">{lead.probabilidade || 0}% probabilidade</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Contato: {new Date(lead.data_contato).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de visualização/edição */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>
                {isEditing ? 'Editar Lead' : 'Detalhes do Lead'}
              </DialogTitle>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      Salvar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              <div className="text-center text-muted-foreground">
                <p>Modal de visualização/edição será implementado na próxima versão</p>
                <p>Lead: {selectedLead.nome} - {selectedLead.empresa}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
