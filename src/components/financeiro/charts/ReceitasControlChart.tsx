import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ReceitaStatusData {
  mes: string;
  pago: number;
  pendente: number;
  atrasado: number;
  projecao: number;
}

interface ReceitasControlChartProps {
  data: ReceitaStatusData[];
  formatCurrency: (value: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, p: any) => sum + p.value, 0);
    
    return (
      <div className="bg-card p-3 border border-border shadow-lg rounded-lg">
        <p className="font-semibold text-card-foreground mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex justify-between gap-4 text-sm mb-1">
            <span style={{ color: p.fill }} className="font-medium">{p.name}:</span>
            <span className="text-card-foreground">{formatCurrency(p.value)}</span>
          </div>
        ))}
        <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold text-card-foreground">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ReceitasControlChart = ({ data, formatCurrency }: ReceitasControlChartProps) => {
  // Calcular totais para os cards
  const totals = data.reduce((acc, item) => ({
    pago: acc.pago + item.pago,
    pendente: acc.pendente + item.pendente,
    atrasado: acc.atrasado + item.atrasado,
    projecao: acc.projecao + item.projecao,
  }), { pago: 0, pendente: 0, atrasado: 0, projecao: 0 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Controle de Receitas por Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Cards de resumo por status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">✅ Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                {formatCurrency(totals.pago)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">⏳ Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {formatCurrency(totals.pendente)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">⚠️ Atrasado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                {formatCurrency(totals.atrasado)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">📊 Projeção</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
                {formatCurrency(totals.projecao)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de colunas empilhadas */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="mes" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px' }}
              iconType="square"
            />
            
            {/* Colunas empilhadas */}
            <Bar dataKey="pago" stackId="a" fill="#10b981" name="Pago" radius={[0, 0, 0, 0]} />
            <Bar dataKey="pendente" stackId="a" fill="#f59e0b" name="Pendente" radius={[0, 0, 0, 0]} />
            <Bar dataKey="atrasado" stackId="a" fill="#ef4444" name="Atrasado" radius={[0, 0, 0, 0]} />
            <Bar dataKey="projecao" stackId="a" fill="#3b82f6" name="Projeção" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
