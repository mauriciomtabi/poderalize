import { useState } from "react";
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
import { Plus, Search, Mail, Phone, Building, Star, Calendar, Target } from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  telefone: string;
  fonte: string;
  status: "novo" | "qualificado" | "proposta" | "negociacao" | "fechado" | "perdido";
  valor: number;
  probabilidade: number;
  dataContato: string;
  observacoes?: string;
}

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "1",
      nome: "Carlos Mendes",
      empresa: "Tech Solutions",
      email: "carlos@techsolutions.com",
      telefone: "(11) 99999-1111",
      fonte: "Website",
      status: "novo",
      valor: 50000,
      probabilidade: 25,
      dataContato: "2024-09-20",
      observacoes: "Interessado em rebranding completo"
    },
    {
      id: "2",
      nome: "Fernanda Lima",
      empresa: "StartupXYZ",
      email: "fernanda@startupxyz.com",
      telefone: "(11) 88888-2222",
      fonte: "LinkedIn",
      status: "qualificado",
      valor: 75000,
      probabilidade: 60,
      dataContato: "2024-09-18",
      observacoes: "Precisa de estratégia digital completa"
    },
    {
      id: "3",
      nome: "Roberto Santos",
      empresa: "Indústria ABC",
      email: "roberto@industriaabc.com",
      telefone: "(11) 77777-3333",
      fonte: "Indicação",
      status: "proposta",
      valor: 120000,
      probabilidade: 80,
      dataContato: "2024-09-15",
      observacoes: "Aguardando aprovação da diretoria"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoLead, setNovoLead] = useState({
    nome: "",
    empresa: "",
    email: "",
    telefone: "",
    fonte: "",
    valor: "",
    observacoes: "",
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
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Lead</DialogTitle>
              </DialogHeader>
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
                    <Label htmlFor="fonte">Fonte</Label>
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
                  <div>
                    <Label htmlFor="valor">Valor Estimado (R$)</Label>
                    <Input
                      id="valor"
                      type="number"
                      value={novoLead.valor}
                      onChange={(e) => setNovoLead({...novoLead, valor: e.target.value})}
                      placeholder="50000"
                    />
                  </div>
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
              <Card key={lead.id} className="card-interactive hover-lift">
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