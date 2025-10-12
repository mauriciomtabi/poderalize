import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { MonthlyData } from "@/utils/financialCalculations";
import { TrendingUp } from "lucide-react";

interface ReceitasDespesasChartProps {
  receitas: MonthlyData[];
  despesas: MonthlyData[];
}

export const ReceitasDespesasChart = ({ receitas, despesas }: ReceitasDespesasChartProps) => {
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
          <TrendingUp size={20} />
          Receitas vs Despesas
        </CardTitle>
        <CardDescription>Comparativo dos últimos 12 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
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
              <Bar 
                dataKey="receitas" 
                fill="var(--color-receitas)" 
                radius={[4, 4, 0, 0]}
                name="Receitas"
              />
              <Bar 
                dataKey="despesas" 
                fill="var(--color-despesas)" 
                radius={[4, 4, 0, 0]}
                name="Despesas"
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="var(--color-saldo)" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Saldo"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
