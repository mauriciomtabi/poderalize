import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
import { CategoryData } from "@/utils/financialCalculations";
import { PieChartIcon } from "lucide-react";

interface DespesasPorCategoriaChartProps {
  data: CategoryData[];
}

export const DespesasPorCategoriaChart = ({ data }: DespesasPorCategoriaChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon size={20} />
            Despesas por Categoria
          </CardTitle>
          <CardDescription>Distribuição percentual das despesas</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[350px]">
          <PieChartIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-sm">Nenhuma despesa registrada neste período</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    name: item.categoria,
    value: item.valor,
    fill: item.cor,
  }));

  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.categoria] = {
      label: item.categoria,
      color: item.cor || `hsl(var(--chart-${(index % 10) + 1}))`,
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const total = data.reduce((sum, item) => sum + item.valor, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon size={20} />
          Despesas por Categoria
        </CardTitle>
        <CardDescription>Distribuição percentual das despesas</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => [
                  `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${((value / total) * 100).toFixed(1)}%)`,
                  ''
                ]}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                labelLine={false}
                label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
