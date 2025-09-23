import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";

const Relatorios = () => {
  // Mock data for demonstrations
  const projectStats = {
    total: 24,
    completed: 18,
    inProgress: 4,
    pending: 2
  };

  const teamStats = {
    totalMembers: 8,
    activeProjects: 12,
    completedTasks: 156,
    pendingTasks: 23
  };

  const leadsStats = {
    total: 89,
    qualified: 34,
    contacted: 28,
    converted: 12
  };

  const recentActivity = [
    { id: 1, action: "Projeto 'Website Redesign' concluído", time: "2h atrás", type: "success" },
    { id: 2, action: "Novo lead qualificado: Empresa ABC", time: "4h atrás", type: "info" },
    { id: 3, action: "Task 'Review Design' atrasada", time: "6h atrás", type: "warning" },
    { id: 4, action: "Maria Silva adicionada ao projeto", time: "1d atrás", type: "info" },
  ];

  return (
    <Layout title="Relatórios">
      <div className="space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Relatórios e Analytics</h2>
              <p className="text-muted-foreground">Dashboard completo de performance da Poderalize</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button size="sm" className="bg-gradient-primary hover:opacity-90">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.inProgress}</div>
              <p className="text-xs text-muted-foreground">
                +2 novos esta semana
              </p>
              <Progress value={75} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                +12% vs mês anterior
              </p>
              <Progress value={87} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-info">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Qualificados</CardTitle>
              <Users className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadsStats.qualified}</div>
              <p className="text-xs text-muted-foreground">
                +8 novos esta semana
              </p>
              <Progress value={60} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14.2d</div>
              <p className="text-xs text-muted-foreground">
                -2.1d vs mês anterior
              </p>
              <Progress value={45} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports Tabs */}
        <Tabs defaultValue="projetos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projetos">Projetos</TabsTrigger>
            <TabsTrigger value="equipe">Equipe</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="projetos" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Projetos</CardTitle>
                  <CardDescription>Distribuição atual dos projetos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-success rounded-full"></div>
                        <span className="text-sm">Concluídos</span>
                      </div>
                      <span className="font-medium">{projectStats.completed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <span className="text-sm">Em Andamento</span>
                      </div>
                      <span className="font-medium">{projectStats.inProgress}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-warning rounded-full"></div>
                        <span className="text-sm">Pendentes</span>
                      </div>
                      <span className="font-medium">{projectStats.pending}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Mensal</CardTitle>
                  <CardDescription>Projetos concluídos por mês</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Janeiro</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={80} className="w-24" />
                        <span className="text-sm font-medium">8</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fevereiro</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={60} className="w-24" />
                        <span className="text-sm font-medium">6</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Março</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={40} className="w-24" />
                        <span className="text-sm font-medium">4</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipe" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Produtividade da Equipe</CardTitle>
                  <CardDescription>Tasks concluídas por membro</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["João Silva", "Maria Santos", "Pedro Costa", "Ana Oliveira"].map((name, index) => (
                      <div key={name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm">{name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={[85, 72, 68, 91][index]} className="w-20" />
                          <span className="text-sm font-medium">{[34, 28, 26, 36][index]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Trabalho</CardTitle>
                  <CardDescription>Carga de trabalho atual</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Sobrecarga</span>
                      <span className="text-sm font-medium text-destructive">1 membro</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Capacidade ideal</span>
                      <span className="text-sm font-medium text-success">5 membros</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Subcarga</span>
                      <span className="text-sm font-medium text-warning">2 membros</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funil de Conversão</CardTitle>
                  <CardDescription>Pipeline de leads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total de Leads</span>
                      <span className="font-medium">{leadsStats.total}</span>
                    </div>
                    <Progress value={100} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Qualificados</span>
                      <span className="font-medium">{leadsStats.qualified}</span>
                    </div>
                    <Progress value={38} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Contatados</span>
                      <span className="font-medium">{leadsStats.contacted}</span>
                    </div>
                    <Progress value={31} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Convertidos</span>
                      <span className="font-medium">{leadsStats.converted}</span>
                    </div>
                    <Progress value={13} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Origem dos Leads</CardTitle>
                  <CardDescription>Principais canais de aquisição</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { source: "Google Ads", count: 32, percentage: 36 },
                      { source: "Redes Sociais", count: 24, percentage: 27 },
                      { source: "Indicação", count: 18, percentage: 20 },
                      { source: "Website", count: 15, percentage: 17 }
                    ].map((item) => (
                      <div key={item.source} className="flex items-center justify-between">
                        <span className="text-sm">{item.source}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={item.percentage} className="w-20" />
                          <span className="text-sm font-medium w-8">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Receita Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">R$ 124.500</div>
                  <p className="text-sm text-muted-foreground">+15% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ticket Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">R$ 8.750</div>
                  <p className="text-sm text-muted-foreground">+5% vs mês anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ROI Projetos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-info">284%</div>
                  <p className="text-sm text-muted-foreground">+12% vs mês anterior</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Atividade Recente</span>
            </CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg border">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-success' :
                    activity.type === 'warning' ? 'bg-warning' : 'bg-info'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type === 'success' ? 'Sucesso' :
                     activity.type === 'warning' ? 'Atenção' : 'Info'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Relatorios;