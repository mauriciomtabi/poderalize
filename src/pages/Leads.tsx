import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Search, Mail, Phone, Building, Star, Calendar, Target, Edit, Trash2, Eye, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Lead, LeadStatus } from "@/types/crm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Leads = () => {
  // Função para carregar dados do localStorage
  const loadLeadsFromStorage = (): Lead[] => {
    try {
      const savedLeads = localStorage.getItem('leads-page-data');
      if (savedLeads) {
        return JSON.parse(savedLeads);
      }
    } catch (error) {
      console.error('Erro ao carregar leads do localStorage:', error);
    }
    return initialLeads;
  };

  // Dados iniciais (fallback caso não tenha no localStorage)
  const initialLeads: Lead[] = [
    {
      id: "1",
      nome: "Carlos Mendes",
      empresa: "Tech Solutions",
      email: "carlos@techsolutions.com",
      telefone: "11 99999-1111",
      fonte: "Website",
      status: "novo",
      valor: 50000,
      probabilidade: 25,
      dataContato: "2024-09-20",
      observacoes: "Interessado em rebranding completo",
      site: "www.techsolutions.com.br",
      instagram: "@techsolutions",
      faturamentoAtual: 80000,
      faturamentoDesejado: 150000,
      doresIdentificadas: ["Baixa visibilidade online", "Poucas vendas"],
      nivelConsciencia: "Consciente do problema",
      etapaJornada: "Consideração",
      indicadorPotencial: "Lead com médio potencial (interessado, mas travado)",
      equipeAtual: "5 colaboradores"
    },
    {
      id: "2",
      nome: "Ana Silva",
      empresa: "Inovare Marketing",
      email: "ana@inovare.com.br",
      telefone: "11 88888-2222",
      fonte: "LinkedIn",
      status: "qualificado",
      valor: 35000,
      probabilidade: 60,
      dataContato: "2024-09-18",
      observacoes: "Precisa de estratégia digital urgente",
      facebook: "facebook.com/inovare",
      outrasRedesSociais: "TikTok, YouTube",
      faturamentoDesejado: 100000,
      doresIdentificadas: ["Falta de estratégia digital", "Concorrência forte"],
      nivelConsciencia: "Consciente da solução",
      etapaJornada: "Decisão",
      indicadorPotencial: "Lead com alto potencial (com verba, decisão e clareza)",
      equipeAtual: "8 colaboradores"
    }
  ];

  const [leads, setLeads] = useState<Lead[]>(loadLeadsFromStorage);

  // Salvar leads no localStorage sempre que a lista mudar
  useEffect(() => {
    try {
      localStorage.setItem('leads-page-data', JSON.stringify(leads));
    } catch (error) {
      console.error('Erro ao salvar leads no localStorage:', error);
    }
  }, [leads]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [novoLead, setNovoLead] = useState({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    fonte: "",
    valor: "",
    observacoes: "",
    
    // Presença Digital
    site: "",
    instagram: "",
    facebook: "",
    outrasRedesSociais: "",
    
    // Faturamento
    faturamentoAtual: "",
    faturamentoDesejado: "",
    
    // Comportamento e Potencial
    doresIdentificadas: [] as string[],
    nivelConsciencia: "",
    etapaJornada: "",
    indicadorPotencial: "",
    equipeAtual: "",
  });

  const statusOptions = [
    { value: "novo", label: "Novo", color: "bg-blue-500" },
    { value: "qualificado", label: "Qualificado", color: "bg-yellow-500" },
    { value: "proposta", label: "Proposta", color: "bg-purple-500" },
    { value: "negociacao", label: "Negociação", color: "bg-orange-500" },
    { value: "fechado", label: "Fechado", color: "bg-green-500" },
    { value: "perdido", label: "Perdido", color: "bg-red-500" },
  ];

  const fonteOptions = [
    "Website",
    "LinkedIn",
    "Facebook",
    "Instagram",
    "Google Ads",
    "Indicação",
    "Evento",
    "Cold Call",
    "E-mail Marketing"
  ];

  const doresOptions = [
    "Baixa visibilidade online",
    "Poucas vendas",
    "Dificuldade para gerar leads",
    "Marca não reconhecida",
    "Concorrência forte",
    "Falta de estratégia digital",
    "Equipe sem capacitação",
    "Processos desorganizados"
  ];

  const nivelConscienciaOptions = [
    "Inconsciente (não sabe que tem um problema)",
    "Consciente do problema",
    "Consciente da solução",
    "Consciente do produto/serviço",
    "Totalmente consciente (pronto para comprar)"
  ];

  const etapaJornadaOptions = [
    "Descoberta",
    "Consideração",
    "Decisão",
    "Fidelização"
  ];

  const indicadorPotencialOptions = [
    "Lead com alto potencial (com verba, decisão e clareza)",
    "Lead com médio potencial (interessado, mas travado)",
    "Lead com baixo potencial (curioso, mas distante do perfil ideal)"
  ];

  const filteredLeads = leads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddLead = () => {
    if (!novoLead.nome || !novoLead.empresa || !novoLead.email) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      ...novoLead,
      valor: parseFloat(novoLead.valor) || 0,
      faturamentoAtual: parseFloat(novoLead.faturamentoAtual) || undefined,
      faturamentoDesejado: parseFloat(novoLead.faturamentoDesejado) || undefined,
      status: "novo",
      probabilidade: 25,
      dataContato: new Date().toISOString().split('T')[0]
    };

    setLeads([...leads, newLead]);
    setNovoLead({
      nome: "",
      empresa: "",
      email: "",
      telefone: "",
      fonte: "",
      valor: "",
      observacoes: "",
      
      // Presença Digital
      site: "",
      instagram: "",
      facebook: "",
      outrasRedesSociais: "",
      
      // Faturamento
      faturamentoAtual: "",
      faturamentoDesejado: "",
      
      // Comportamento e Potencial
      doresIdentificadas: [] as string[],
      nivelConsciencia: "",
      etapaJornada: "",
      indicadorPotencial: "",
      equipeAtual: "",
    });
    setIsDialogOpen(false);
    toast.success("Lead adicionado com sucesso!");
  };

  const getStatusConfig = (status: string) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalValue = leads.reduce((sum, lead) => sum + (lead.valor * lead.probabilidade / 100), 0);

  const handleCardClick = (lead: Lead) => {
    setSelectedLead(lead);
    setEditingLead({ ...lead });
    setIsViewModalOpen(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingLead(selectedLead ? { ...selectedLead } : null);
  };

  const handleSaveEdit = () => {
    if (!editingLead) return;
    
    setLeads(leads.map(lead => 
      lead.id === editingLead.id ? editingLead : lead
    ));
    setSelectedLead(editingLead);
    setIsEditing(false);
    toast.success("Lead atualizado com sucesso!");
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads(leads.filter(lead => lead.id !== leadId));
    setLeadToDelete(null);
    setIsViewModalOpen(false);
    toast.success("Lead removido com sucesso!");
  };

  return (
    <Layout title="Gestão de Leads">
      <div className="space-y-6 animate-fade-in">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(leads.reduce((sum, lead) => sum + lead.valor, 0))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Ponderado</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalValue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'fechado').length / leads.length) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Header com busca e botão de adicionar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus size={16} className="mr-2" />
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
                      <Label htmlFor="telefone">Telefone</Label>
                      <div className="flex">
                        <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                          🇧🇷 +55
                        </div>
                        <Input
                          id="telefone"
                          value={novoLead.telefone}
                          onChange={(e) => setNovoLead({...novoLead, telefone: e.target.value})}
                          placeholder="11 99999-9999"
                          className="rounded-l-none"
                        />
                      </div>
                    </div>
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
                  </div>
                </div>

                {/* Presença Digital */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">PRESENÇA DIGITAL</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="site">Site</Label>
                      <Input
                        id="site"
                        value={novoLead.site}
                        onChange={(e) => setNovoLead({...novoLead, site: e.target.value})}
                        placeholder="www.empresa.com.br"
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
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={novoLead.facebook}
                        onChange={(e) => setNovoLead({...novoLead, facebook: e.target.value})}
                        placeholder="facebook.com/empresa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="outrasRedesSociais">Outras Redes Sociais (LinkedIn, TikTok, etc.)</Label>
                      <Input
                        id="outrasRedesSociais"
                        value={novoLead.outrasRedesSociais}
                        onChange={(e) => setNovoLead({...novoLead, outrasRedesSociais: e.target.value})}
                        placeholder="LinkedIn, TikTok, YouTube..."
                      />
                    </div>
                  </div>
                </div>

                {/* Faturamento */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">FATURAMENTO</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="faturamentoAtual">Faturamento Mensal Atual</Label>
                      <Input
                        id="faturamentoAtual"
                        type="number"
                        value={novoLead.faturamentoAtual}
                        onChange={(e) => setNovoLead({...novoLead, faturamentoAtual: e.target.value})}
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="faturamentoDesejado">Faturamento Mensal Desejado</Label>
                      <Input
                        id="faturamentoDesejado"
                        type="number"
                        value={novoLead.faturamentoDesejado}
                        onChange={(e) => setNovoLead({...novoLead, faturamentoDesejado: e.target.value})}
                        placeholder="100000"
                      />
                    </div>
                  </div>
                </div>

                {/* Comportamento e Potencial */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">COMPORTAMENTO E POTENCIAL</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Dores identificadas</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                        {doresOptions.map((dor) => (
                          <label key={dor} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={novoLead.doresIdentificadas.includes(dor)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNovoLead({
                                    ...novoLead,
                                    doresIdentificadas: [...novoLead.doresIdentificadas, dor]
                                  });
                                } else {
                                  setNovoLead({
                                    ...novoLead,
                                    doresIdentificadas: novoLead.doresIdentificadas.filter(d => d !== dor)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{dor}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="nivelConsciencia">Nível de consciência sobre marketing e vendas</Label>
                      <Select onValueChange={(value) => setNovoLead({...novoLead, nivelConsciencia: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {nivelConscienciaOptions.map((opcao) => (
                            <SelectItem key={opcao} value={opcao}>
                              {opcao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="etapaJornada">Etapa da Jornada Poderalize</Label>
                      <Select onValueChange={(value) => setNovoLead({...novoLead, etapaJornada: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {etapaJornadaOptions.map((etapa) => (
                            <SelectItem key={etapa} value={etapa}>
                              {etapa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="fonte">Fonte do Lead</Label>
                      <Select onValueChange={(value) => setNovoLead({...novoLead, fonte: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Como nos conheceu?" />
                        </SelectTrigger>
                        <SelectContent>
                          {fonteOptions.map((fonte) => (
                            <SelectItem key={fonte} value={fonte}>
                              {fonte}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="indicadorPotencial">Indicador de Potencial</Label>
                      <Select onValueChange={(value) => setNovoLead({...novoLead, indicadorPotencial: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {indicadorPotencialOptions.map((indicador) => (
                            <SelectItem key={indicador} value={indicador}>
                              {indicador}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="equipeAtual">Equipe atual / Nº de colaboradores</Label>
                      <Input
                        id="equipeAtual"
                        value={novoLead.equipeAtual}
                        onChange={(e) => setNovoLead({...novoLead, equipeAtual: e.target.value})}
                        placeholder="Exemplo: 3 colaboradores fixos e 2 freelancers"
                      />
                    </div>
                  </div>
                </div>

                {/* Campos Finais */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="valor">Valor Estimado do Projeto (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      value={novoLead.valor}
                      onChange={(e) => setNovoLead({...novoLead, valor: e.target.value})}
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={novoLead.observacoes}
                      onChange={(e) => setNovoLead({...novoLead, observacoes: e.target.value})}
                      placeholder="Detalhes sobre o lead..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddLead} className="btn-primary">
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de leads */}
        <div className="grid gap-4">
          {filteredLeads.map((lead) => {
            const statusConfig = getStatusConfig(lead.status);
            return (
              <Card 
                key={lead.id} 
                className="card-interactive hover-lift cursor-pointer transition-all duration-200"
                onClick={() => handleCardClick(lead)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{lead.nome}</h3>
                        <Badge className={`${statusConfig.color} text-white`}>
                          {statusConfig.label}
                        </Badge>
                        <Badge variant="outline">{lead.fonte}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Building size={14} className="text-muted-foreground" />
                            <span className="font-medium">{lead.empresa}</span>
                          </div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Mail size={14} className="text-muted-foreground" />
                            <span className="text-muted-foreground">{lead.email}</span>
                          </div>
                          {lead.telefone && (
                            <div className="flex items-center space-x-2">
                              <Phone size={14} className="text-muted-foreground" />
                              <span className="text-muted-foreground">{lead.telefone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div className="mb-2">
                            <span className="text-muted-foreground">Valor: </span>
                            <span className="font-semibold">{formatCurrency(lead.valor)}</span>
                          </div>
                          <div className="mb-2">
                            <span className="text-muted-foreground">Probabilidade: </span>
                            <span className="font-semibold">{lead.probabilidade}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Valor Ponderado: </span>
                            <span className="font-semibold text-primary">
                              {formatCurrency(lead.valor * lead.probabilidade / 100)}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="mb-2">
                            <span className="text-muted-foreground">Primeiro Contato: </span>
                            <span>{new Date(lead.dataContato).toLocaleDateString('pt-BR')}</span>
                          </div>
                          {lead.observacoes && (
                            <div>
                              <span className="text-muted-foreground">Observações: </span>
                              <p className="text-sm mt-1">{lead.observacoes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modal de visualização/edição do lead */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <Eye size={20} />
                  {isEditing ? "Editando Lead" : "Detalhes do Lead"}
                </DialogTitle>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit size={16} className="mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => selectedLead && setLeadToDelete(selectedLead.id)}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Remover
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <X size={16} className="mr-1" />
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Save size={16} className="mr-1" />
                        Salvar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </DialogHeader>
            
            {selectedLead && editingLead && (
              <div className="space-y-6">
                {/* Dados Básicos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">DADOS BÁSICOS</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-nome">Nome</Label>
                      <Input
                        id="edit-nome"
                        value={editingLead.nome}
                        onChange={(e) => setEditingLead({...editingLead, nome: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-empresa">Empresa</Label>
                      <Input
                        id="edit-empresa"
                        value={editingLead.empresa}
                        onChange={(e) => setEditingLead({...editingLead, empresa: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-email">E-mail</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editingLead.email}
                        onChange={(e) => setEditingLead({...editingLead, email: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-telefone">Telefone</Label>
                      <Input
                        id="edit-telefone"
                        value={editingLead.telefone || ""}
                        onChange={(e) => setEditingLead({...editingLead, telefone: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-status">Status</Label>
                      <Select 
                        value={editingLead.status} 
                        onValueChange={(value) => setEditingLead({...editingLead, status: value as LeadStatus})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-fonte">Fonte</Label>
                      <Select 
                        value={editingLead.fonte} 
                        onValueChange={(value) => setEditingLead({...editingLead, fonte: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fonteOptions.map((fonte) => (
                            <SelectItem key={fonte} value={fonte}>
                              {fonte}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-valor">Valor Estimado</Label>
                      <Input
                        id="edit-valor"
                        type="number"
                        value={editingLead.valor}
                        onChange={(e) => setEditingLead({...editingLead, valor: parseFloat(e.target.value) || 0})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Presença Digital */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">PRESENÇA DIGITAL</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-site">Site</Label>
                      <Input
                        id="edit-site"
                        value={editingLead.site || ""}
                        onChange={(e) => setEditingLead({...editingLead, site: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-instagram">Instagram</Label>
                      <Input
                        id="edit-instagram"
                        value={editingLead.instagram || ""}
                        onChange={(e) => setEditingLead({...editingLead, instagram: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-facebook">Facebook</Label>
                      <Input
                        id="edit-facebook"
                        value={editingLead.facebook || ""}
                        onChange={(e) => setEditingLead({...editingLead, facebook: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-outrasRedes">Outras Redes Sociais</Label>
                      <Input
                        id="edit-outrasRedes"
                        value={editingLead.outrasRedesSociais || ""}
                        onChange={(e) => setEditingLead({...editingLead, outrasRedesSociais: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Faturamento */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">FATURAMENTO</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-faturamentoAtual">Faturamento Atual</Label>
                      <Input
                        id="edit-faturamentoAtual"
                        type="number"
                        value={editingLead.faturamentoAtual || ""}
                        onChange={(e) => setEditingLead({...editingLead, faturamentoAtual: parseFloat(e.target.value) || undefined})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-faturamentoDesejado">Faturamento Desejado</Label>
                      <Input
                        id="edit-faturamentoDesejado"
                        type="number"
                        value={editingLead.faturamentoDesejado || ""}
                        onChange={(e) => setEditingLead({...editingLead, faturamentoDesejado: parseFloat(e.target.value) || undefined})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Comportamento e Potencial */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">COMPORTAMENTO E POTENCIAL</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nível de Consciência</Label>
                      <Select 
                        value={editingLead.nivelConsciencia || ""} 
                        onValueChange={(value) => setEditingLead({...editingLead, nivelConsciencia: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {nivelConscienciaOptions.map((opcao) => (
                            <SelectItem key={opcao} value={opcao}>
                              {opcao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Etapa da Jornada</Label>
                      <Select 
                        value={editingLead.etapaJornada || ""} 
                        onValueChange={(value) => setEditingLead({...editingLead, etapaJornada: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {etapaJornadaOptions.map((etapa) => (
                            <SelectItem key={etapa} value={etapa}>
                              {etapa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Indicator de Potencial</Label>
                      <Select 
                        value={editingLead.indicadorPotencial || ""} 
                        onValueChange={(value) => setEditingLead({...editingLead, indicadorPotencial: value})}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {indicadorPotencialOptions.map((indicador) => (
                            <SelectItem key={indicador} value={indicador}>
                              {indicador}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-equipe">Equipe Atual</Label>
                      <Input
                        id="edit-equipe"
                        value={editingLead.equipeAtual || ""}
                        onChange={(e) => setEditingLead({...editingLead, equipeAtual: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {editingLead.doresIdentificadas && editingLead.doresIdentificadas.length > 0 && (
                    <div>
                      <Label>Dores Identificadas</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editingLead.doresIdentificadas.map((dor, index) => (
                          <Badge key={index} variant="secondary">
                            {dor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Observações */}
                <div>
                  <Label htmlFor="edit-observacoes">Observações</Label>
                  <Textarea
                    id="edit-observacoes"
                    value={editingLead.observacoes || ""}
                    onChange={(e) => setEditingLead({...editingLead, observacoes: e.target.value})}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmação de exclusão */}
        <AlertDialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover este lead? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => leadToDelete && handleDeleteLead(leadToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <Target size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              Nenhum lead encontrado
            </h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Tente buscar com outros termos" : "Adicione o primeiro lead"}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Leads;