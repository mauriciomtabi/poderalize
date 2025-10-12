import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { MonthlyData } from "@/utils/financialCalculations";
import { Activity } from "lucide-react";

interface EvolucaoMensalChartProps {
  receitas: MonthlyData[];
  despesas: MonthlyData[];
}

export const EvolucaoMensalChart = ({ receitas, despesas }: EvolucaoMensalChartProps) => {
  if (!receitas || receitas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            Evolução Mensal
          </CardTitle>
          <CardDescription>Comparativo temporal de receitas, despesas e saldo</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[350px]">
          <Activity className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-sm">Nenhum dado disponível para este período</p>
        </CardContent>
      </Card>
    );
  }

  const data = receitas.map((rec, index) => ({
    mes: rec.mes,
    receitas: rec.valor,
    despesas: despesas[index]?.valor || 0,
    saldo: rec.valor - (despesas[index]?.valor || 0),
  }));

  const chartConfig = {
    receitas: {
      label: "Receitas",
      color: "hsl(var(--chart-1))",
    },
    despesas: {
      label: "Despesas",
      color: "hsl(var(--destructive))",
    },
    saldo: {
      label: "Saldo",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity size={20} />
          Evolução Mensal
        </CardTitle>
        <CardDescription>Comparativo temporal de receitas, despesas e saldo</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="mes" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receitas" 
                stroke="var(--color-receitas)" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Receitas"
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                stroke="var(--color-despesas)" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Despesas"
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="var(--color-saldo)" 
                strokeWidth={3}
                dot={{ r: 5 }}
                name="Saldo"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
