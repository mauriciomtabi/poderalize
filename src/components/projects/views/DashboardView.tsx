import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Target
} from "lucide-react";
import { useProjects } from "@/contexts/ProjectsContext";
import { DashboardMetrics, Priority, CardStatus } from "@/types/projects";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from "recharts";

const PRIORITY_COLORS = {
  low: '#3b82f6',
  medium: '#f59e0b', 
  high: '#ef4444',
  urgent: '#dc2626'
};

const STATUS_COLORS = {
  'todo': '#6b7280',
  'in-progress': '#3b82f6',
  'review': '#f59e0b',
  'blocked': '#ef4444',
  'done': '#10b981'
};

export const DashboardView = () => {
  const { state, actions } = useProjects();
  
  if (!state.currentBoard) {
    return <div className="flex items-center justify-center h-full">Nenhum projeto selecionado</div>;
  }

  const allCards = state.currentBoard.lists.flatMap(list => list.cards);
  const cards = actions.getFilteredCards();

  // Calculate metrics
  const metrics: DashboardMetrics = {
    totalCards: allCards.length,
    completedCards: cards.filter(card => card.status === 'done').length,
    overdue: cards.filter(card => 
      card.dueDate && new Date(card.dueDate) < new Date() && card.status !== 'done'
    ).length,
    completionRate: cards.length > 0 ? (cards.filter(card => card.status === 'done').length / cards.length) * 100 : 0,
    averageTimeToComplete: 0,
    cardsByStatus: cards.reduce((acc, card) => {
      acc[card.status] = (acc[card.status] || 0) + 1;
      return acc;
    }, {} as Record<CardStatus, number>),
    cardsByPriority: cards.reduce((acc, card) => {
      acc[card.priority] = (acc[card.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>),
    cardsByMember: cards.reduce((acc, card) => {
      card.assignees.forEach(assignee => {
        acc[assignee.name] = (acc[assignee.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    cardsByLabel: cards.reduce((acc, card) => {
      card.labels.forEach(label => {
        acc[label.name] = (acc[label.name] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
    activityTrend: []
  };

  // Prepare chart data
  const statusChartData = Object.entries(metrics.cardsByStatus).map(([status, count]) => ({
    name: status === 'todo' ? 'A fazer' :
          status === 'in-progress' ? 'Em andamento' :
          status === 'review' ? 'Revisão' :
          status === 'blocked' ? 'Bloqueado' : 'Concluído',
    value: count,
    color: STATUS_COLORS[status as CardStatus]
  }));

  const labelData = (() => {
    const labelCounts: { [key: string]: { count: number; color: string; name: string } } = {};
    
    cards.forEach(card => {
      card.labels.forEach(label => {
        if (labelCounts[label.id]) {
          labelCounts[label.id].count++;
        } else {
          labelCounts[label.id] = {
            count: 1,
            color: label.color,
            name: label.name
          };
        }
      });
    });

    return Object.entries(labelCounts).map(([id, data]) => ({
      name: data.name,
      value: data.count,
      color: data.color
    })).sort((a, b) => b.value - a.value).slice(0, 8);
  })();

  const memberChartData = Object.entries(metrics.cardsByMember)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name: name.split(' ')[0], // First name only
      value: count
    }));

  return (
    <div className="h-full p-6 space-y-6 overflow-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cartões</CardTitle>
            <BarChart3 size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCards}</div>
            <p className="text-xs text-muted-foreground">
              {cards.length} após filtros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Target size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.completionRate)}%</div>
            <Progress value={metrics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle2 size={16} className="text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.completedCards}</div>
            <p className="text-xs text-muted-foreground">
              de {metrics.totalCards} cartões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
            <AlertTriangle size={16} className="text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.overdue}</div>
            <p className="text-xs text-muted-foreground">
              cartões atrasados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Label Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Etiqueta</CardTitle>
          </CardHeader>
          <CardContent>
            {labelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={labelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))">
                    {labelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">Nenhuma etiqueta encontrada</div>
                  <div className="text-sm">Adicione etiquetas aos cartões para ver a distribuição</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Workload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Carga de Trabalho por Membro</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberChartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Membros da Equipe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.currentBoard.members.map((member) => {
              const memberCards = cards.filter(card => 
                card.assignees.some(assignee => assignee.id === member.id)
              );
              const completedCards = memberCards.filter(card => card.status === 'done');
              const completionRate = memberCards.length > 0 ? (completedCards.length / memberCards.length) * 100 : 0;

              return (
                <div key={member.id} className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium">{member.name}</div>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{memberCards.length} cartões</span>
                      <span>{Math.round(completionRate)}% concluído</span>
                    </div>
                    
                    <Progress value={completionRate} className="mt-2 h-2" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity would go here */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Clock size={32} className="mx-auto mb-2 opacity-50" />
            <div>Funcionalidade de atividade recente em desenvolvimento</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};