import { useCRM } from "@/contexts/CRMContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

export const CRMDashboard = () => {
  const { currentFunnel, leadHooks } = useCRM();

  if (!currentFunnel) return null;

  // Filter leads that belong to this funnel
  const funnelLeads = leadHooks.leads.filter(lead => lead.funnel_id === currentFunnel.id);

  // Group by stage
  const stageData = currentFunnel.stages.map(stage => {
    const leadsInStage = funnelLeads.filter(lead => lead.funnel_stage_id === stage.id);
    const count = leadsInStage.length;
    const value = leadsInStage.reduce((sum, lead) => sum + (lead.valor || 0), 0);
    return {
      name: stage.title,
      count,
      value,
      color: stage.color || '#3b82f6'
    };
  });

  const totalValue = funnelLeads.reduce((sum, lead) => sum + (lead.valor || 0), 0);
  const totalLeads = funnelLeads.length;

  const formatMoney = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 pb-6 pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Leads no Funil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total no Funil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatMoney(totalValue)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Leads por Etapa</CardTitle>
            <CardDescription>Quantidade de leads em cada etapa do funil</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <RechartsTooltip formatter={(value) => [value + ' leads', 'Quantidade']} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stageData.map((entry, index) => (
                    <Cell key={'cell-' + index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Valor por Etapa</CardTitle>
            <CardDescription>Distribui��o financeira do funil</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => name + ' (' + (percent * 100).toFixed(0) + '%)'}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stageData.filter(d => d.value > 0).map((entry, index) => (
                    <Cell key={'cell-' + index} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [formatMoney(value), 'Valor']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
