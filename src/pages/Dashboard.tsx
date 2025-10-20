import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { FunnelChart } from "@/components/crm/FunnelChart";
import { LeadScoring } from "@/components/crm/LeadScoring";
import { RecommendationEngine } from "@/components/crm/RecommendationEngine";
import { GamificationBadges } from "@/components/crm/GamificationBadges";
import { FunnelStep, RecomendacaoIA } from "@/types/crm";
import { 
  Users, 
  Target, 
  TrendingUp, 
  DollarSign,
  UserPlus,
  Plus,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  Zap,
  Brain,
  Star
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Leads Ativos",
      value: "87",
      change: "+15 esta semana",
      icon: Users,
      color: "text-blue-600",
      description: "Leads em acompanhamento"
    },
    {
      title: "Taxa de Conversão Global", 
      value: "24.5%",
      change: "+5.2% este mês",
      icon: Target,
      color: "text-green-600",
      description: "Conversão geral do funil"
    },
    {
      title: "Leads Quentes",
      value: "23",
      change: "+8 hoje", 
      icon: Zap,
      color: "text-red-600",
      description: "Prontos para fechamento"
    },
    {
      title: "Receita Estimada",
      value: "R$ 145.2K",
      change: "+22% este mês",
      icon: DollarSign,
      color: "text-orange-600",
      description: "Baseada no pipeline"
    }
  ];

  // Dados do funil de vendas
  const funnelData: FunnelStep[] = [
    { etapa: 'descoberta', quantidade: 120, conversao: 45, tempoMedio: 3, receita: 0 },
    { etapa: 'consideracao', quantidade: 87, conversao: 35, tempoMedio: 7, receita: 25000 },
    { etapa: 'decisao', quantidade: 45, conversao: 52, tempoMedio: 5, receita: 85000 },
    { etapa: 'fechamento', quantidade: 23, conversao: 78, tempoMedio: 2, receita: 145200 },
    { etapa: 'fidelizacao', quantidade: 18, conversao: 100, tempoMedio: 30, receita: 180000 }
  ];

  // Recomendações da IA
  const recomendacoes: RecomendacaoIA[] = [
    {
      leadId: "1",
      tipo: "alerta",
      titulo: "Lead Maria Santos sem contato há 5 dias",
      descricao: "Lead com alta pontuação sem follow-up recente",
      prioridade: "alta",
      sugestao: "Enviar mensagem personalizada abordando a necessidade de clareza identificada no perfil emocional"
    },
    {
      leadId: "2", 
      tipo: "oportunidade",
      titulo: "João Silva demonstrou interesse em upgrade",
      descricao: "Interações recentes indicam abertura para proposta premium",
      prioridade: "media",
      sugestao: "Agendar reunião para apresentar solução completa, usar discurso técnico conforme perfil"
    }
  ];

  const recentActivities = [
    {
      user: "João Silva",
      action: "avançou para etapa de decisão",
      target: "Lead: Tech Solutions Ltd", 
      time: "2 horas atrás"
    },
    {
      user: "IA Poderalize",
      action: "identificou trava emocional",
      target: "Lead: Maria Santos - Insegurança financeira",
      time: "3 horas atrás"
    },
    {
      user: "Pedro Costa", 
      action: "conquistou badge",
      target: "Speed Closer - Fechamento em 24h",
      time: "4 horas atrás"
    }
  ];

  return (
    <div className="space-y-6 landscape:space-y-3 sm:space-y-8">
        {/* Page Title */}
        <div className="space-y-1">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-fade-in">
            Dashboard
          </h2>
          <p className="text-muted-foreground">Visão geral do seu negócio e métricas importantes</p>
        </div>

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground p-4 landscape:p-2 sm:p-6 rounded-lg">
          <h1 className="text-lg landscape:text-base sm:text-xl md:text-2xl font-bold mb-2 landscape:mb-1">
            🚀 CRM Poderalize - Inteligência em Vendas
          </h1>
          <p className="text-sm landscape:text-xs sm:text-base opacity-90">
            Transforme leads em clientes usando psicologia de vendas e IA avançada.
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 landscape:gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 landscape:pb-1 p-6 landscape:p-3">
                  <CardTitle className="text-sm landscape:text-xs font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 landscape:h-4 landscape:w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent className="p-6 landscape:p-3 pt-0 landscape:pt-0">
                  <div className="text-2xl landscape:text-xl font-bold">{stat.value}</div>
                  <p className="text-xs landscape:text-[10px] text-muted-foreground mb-1 landscape:mb-0">
                    {stat.change}
                  </p>
                  <p className="text-xs landscape:text-[10px] text-muted-foreground/80">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Funil de Vendas */}
        <FunnelChart steps={funnelData} />

        {/* Dashboard Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recomendações IA */}
          <RecommendationEngine 
            recomendacoes={recomendacoes}
            onAplicarSugestao={(leadId) => {
              console.log(`Aplicando sugestão para lead ${leadId}`);
            }}
          />

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.action}
                      </p>
                      <p className="text-xs font-medium text-primary">
                        {activity.target}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gamificação */}
          <GamificationBadges 
            badges={['primeiro_fechamento', 'meta_batida', 'conversao_alta']}
            pontuacao={1250}
            nivel={3}
          />
        </div>
      </div>
    );
  };

  export default Dashboard;