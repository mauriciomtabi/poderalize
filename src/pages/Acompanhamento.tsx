import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FollowUpCalendar } from "@/components/crm/FollowUpCalendar";
import { FollowUp } from "@/types/crm";
import { 
  Calendar, 
  Clock, 
  Phone, 
  MessageSquare, 
  Mail, 
  Users, 
  Plus,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

const Acompanhamento = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Mock data de follow-ups
  const [followUps, setFollowUps] = useState<FollowUp[]>([
    {
      id: "1",
      leadId: "1",
      leadNome: "Maria Silva",
      dataAgendada: "2024-01-15T14:00:00",
      tipo: "ligacao",
      status: "pendente",
      observacoes: "Retornar ligação sobre proposta de consultoria",
      templateMensagem: "Olá Maria, como conversamos, estou entrando em contato para discutir os detalhes da proposta...",
      vendedorId: "1"
    },
    {
      id: "2", 
      leadId: "2",
      leadNome: "João Santos",
      dataAgendada: "2024-01-15T16:30:00",
      tipo: "whatsapp",
      status: "pendente",
      observacoes: "Enviar material complementar via WhatsApp",
      templateMensagem: "Oi João! Conforme combinado, segue o material que você pediu sobre nossos serviços...",
      vendedorId: "1"
    },
    {
      id: "3",
      leadId: "3", 
      leadNome: "Ana Costa",
      dataAgendada: "2024-01-14T10:00:00",
      tipo: "email",
      status: "concluido",
      observacoes: "Email enviado com proposta personalizada",
      vendedorId: "2"
    },
    {
      id: "4",
      leadId: "4",
      leadNome: "Pedro Lima",
      dataAgendada: "2024-01-13T15:00:00",
      tipo: "reuniao",
      status: "pendente",
      observacoes: "VENCIDO - Reunião de apresentação técnica",
      vendedorId: "1"
    }
  ]);

  const handleMarcarConcluido = (id: string) => {
    setFollowUps(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'concluido' as const } : f
    ));
  };

  const handleReagendar = (id: string) => {
    setFollowUps(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'reagendado' as const } : f
    ));
  };

  const followUpsFiltrados = followUps.filter(followUp => {
    const matchesSearch = followUp.leadNome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filtroStatus === "todos" || followUp.status === filtroStatus;
    return matchesSearch && matchesStatus;
  });

  const estatisticas = {
    totalFollowUps: followUps.length,
    pendentes: followUps.filter(f => f.status === 'pendente').length,
    concluidos: followUps.filter(f => f.status === 'concluido').length,
    vencidos: followUps.filter(f => 
      f.status === 'pendente' && new Date(f.dataAgendada) < new Date()
    ).length
  };

  const templatesMensagem = [
    {
      nome: "Follow-up Inicial",
      conteudo: "Olá {nome}! Espero que esteja bem. Gostaria de dar continuidade à nossa conversa sobre {produto}..."
    },
    {
      nome: "Proposta Enviada", 
      conteudo: "Oi {nome}, enviei a proposta por email. Gostaria de agendar uma conversa para esclarecer dúvidas?"
    },
    {
      nome: "Urgência Gentil",
      conteudo: "Oi {nome}, notei que ainda não conseguimos finalizar nossa conversa. Posso ajudar com alguma dúvida?"
    },
    {
      nome: "Oferta Especial",
      conteudo: "Olá {nome}! Temos uma condição especial válida até o final do mês. Gostaria de saber mais?"
    }
  ];

  return (
    <Layout title="Acompanhamento Inteligente">
      <div className="space-y-6">
        {/* Header com Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Follow-ups</p>
                  <p className="text-2xl font-bold">{estatisticas.totalFollowUps}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.concluidos}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vencidos</p>
                  <p className="text-2xl font-bold text-red-600">{estatisticas.vencidos}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros e Busca
              </span>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Novo Follow-up
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nome do lead..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                {['todos', 'pendente', 'concluido', 'reagendado'].map((status) => (
                  <Badge 
                    key={status}
                    variant={filtroStatus === status ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFiltroStatus(status)}
                  >
                    {status === 'todos' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar de Follow-ups */}
          <div className="lg:col-span-2">
            <FollowUpCalendar 
              followUps={followUpsFiltrados}
              onMarcarConcluido={handleMarcarConcluido}
              onReagendar={handleReagendar}
            />
          </div>

          {/* Templates e Ferramentas */}
          <div className="space-y-6">
            {/* Templates de Mensagem */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Templates Inteligentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {templatesMensagem.map((template, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <h4 className="font-medium text-sm">{template.nome}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.conteudo}
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Usar Template
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Checklist de Fechamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Checklist de Fechamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    'Identificar necessidade real',
                    'Mapear trava emocional', 
                    'Apresentar solução personalizada',
                    'Tratar objeções principais',
                    'Criar urgência',
                    'Fechar negócio',
                    'Agendar onboarding'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Acompanhamento;