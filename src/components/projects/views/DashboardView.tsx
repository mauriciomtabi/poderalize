import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { BarChart3, TrendingUp, Users, Clock, CheckCircle2, AlertTriangle, Calendar, Target } from "lucide-react";
import { useProjects } from "@/contexts/ProjectsContext";
import { DashboardMetrics, Priority, CardStatus } from "@/types/projects";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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

const CHART_COLORS = [
  '#ef4444', // red
  '#f59e0b', // orange
  '#10b981', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange-dark
  '#06b6d4', // cyan
  '#a855f7', // violet
];
export const DashboardView = () => {
  const {
    state,
    actions
  } = useProjects();
  
  if (!state.currentBoard) {
    return <div className="flex items-center justify-center h-full">Nenhum projeto selecionado</div>;
  }
  const allCards = state.currentBoard.lists.flatMap(list => list.cards.filter(card => !card.archived));
  const cards = actions.getFilteredCards();

  // Calculate metrics - considering only cards in "Executado" list
  const executadoList = state.currentBoard.lists.find(list => 
    list.title.toLowerCase().match(/^(executado|concluído|concluidos|done)$/i)
  );
  const completedCards = executadoList ? executadoList.cards.filter(card => !card.archived).length : 0;
  const metrics: DashboardMetrics = {
    totalCards: allCards.length,
    completedCards: completedCards,
    overdue: allCards.filter(card => card.dueDate && new Date(card.dueDate) < new Date() && card.status !== 'done').length,
    completionRate: allCards.length > 0 ? (completedCards / allCards.length) * 100 : 0,
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

  // Prepare chart data - distribution by lists (not card status)
  const statusChartData = state.currentBoard.lists
    .filter(list => !list.archived)
    .map((list, index) => {
      const activeCards = list.cards.filter(card => !card.archived);
      console.log(`Lista "${list.title}": ${list.cards.length} total, ${activeCards.length} ativos, ${list.cards.filter(c => c.archived).length} arquivados`);
      return {
        name: list.title,
        value: activeCards.length,
        color: CHART_COLORS[index % CHART_COLORS.length]
      };
    })
    .filter(item => {
      console.log(`Filtrando item "${item.name}" com value ${item.value}`);
      return item.value > 0;
    })
    .sort((a, b) => b.value - a.value);
  
  console.log('Status Chart Data Final:', statusChartData);
  const labelData = (() => {
    const labelCounts: {
      [key: string]: {
        count: number;
        color: string;
        name: string;
      };
    } = {};
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
  const memberChartData = Object.entries(metrics.cardsByMember).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, count]) => ({
    name: name.split(' ')[0],
    // First name only
    value: count
  }));
  return <div className="h-full p-6 space-y-6 overflow-auto">
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
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={statusChartData} 
                    cx="50%" 
                    cy="50%" 
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100} 
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} cartões`, 'Quantidade']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">Nenhum cartão encontrado</div>
                  <div className="text-sm">Adicione cartões ao projeto para ver a distribuição</div>
                </div>
              </div>
            )}
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
                <BarChart data={labelData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12} 
                    stroke="hsl(var(--foreground))"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                  />
                  <YAxis 
                    hide
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} cartões`, 'Quantidade']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[8, 8, 0, 0]}
                    label={{ position: 'top', fill: 'hsl(var(--foreground))', fontSize: 12 }}
                  >
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

      {/* Team Members - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Membros da Equipe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.currentBoard.members.map(member => {
            // Get all cards from all lists
            const allCards = state.currentBoard.lists.flatMap(list => list.cards);
            
            // Get all checklist items assigned to this member from all cards
            const memberItems = allCards
              .flatMap(card => card.customFields?.checklists || [])
              .flatMap(checklist => checklist.items || [])
              .filter(item => item.assignee === member.id);
            
            const completedItems = memberItems.filter(item => item.completed);
            const completionRate = memberItems.length > 0 ? (completedItems.length / memberItems.length) * 100 : 0;
            
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
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                    <span>{memberItems.length} tarefas</span>
                    <span>{completedItems.length} / {memberItems.length} completas</span>
                  </div>
                  
                  <Progress value={completionRate} className="h-2" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          {allCards.length > 0 ? (
            <div className="space-y-4">
              {allCards
                .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .slice(0, 10)
                .map((card) => {
                  const list = state.currentBoard?.lists.find(l => l.id === card.listId);
                  const timeAgo = (() => {
                    const diff = Date.now() - new Date(card.updatedAt).getTime();
                    const minutes = Math.floor(diff / 60000);
                    const hours = Math.floor(diff / 3600000);
                    const days = Math.floor(diff / 86400000);
                    
                    if (days > 0) return `há ${days} dia${days > 1 ? 's' : ''}`;
                    if (hours > 0) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
                    if (minutes > 0) return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
                    return 'agora mesmo';
                  })();

                  return (
                    <div key={card.id} className="flex items-start space-x-3 pb-3 border-b last:border-0">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0`} 
                           style={{ backgroundColor: STATUS_COLORS[card.status] }} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium truncate">{card.title}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {list?.title || 'Lista desconhecida'}
                          </span>
                          {card.assignees.length > 0 && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <div className="flex -space-x-2">
                                {card.assignees.slice(0, 3).map((assignee) => (
                                  <Avatar key={assignee.id} className="h-5 w-5 border-2 border-background">
                                    <AvatarImage src={assignee.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {assignee.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {card.assignees.length > 3 && (
                                  <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                    <span className="text-[10px] font-medium">+{card.assignees.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <div>Nenhuma atividade recente</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>;
};