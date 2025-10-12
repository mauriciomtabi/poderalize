import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
import { CategoryData } from "@/utils/financialCalculations";
import { PieChartIcon } from "lucide-react";

interface DespesasPorCategoriaChartProps {
  data: CategoryData[];
}

export const DespesasPorCategoriaChart = ({ data }: DespesasPorCategoriaChartProps) => {
  const chartData = data.map(item => ({
    name: item.categoria,
    value: item.valor,
    fill: item.cor,
  }));

  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.categoria] = {
      label: item.categoria,
      color: item.cor || `hsl(var(--chart-${(index % 5) + 1}))`,
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
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
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
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
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
