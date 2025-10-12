import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
import { SourceData } from "@/utils/financialCalculations";
import { DollarSign } from "lucide-react";

interface ReceitasPorFonteChartProps {
  data: SourceData[];
}

export const ReceitasPorFonteChart = ({ data }: ReceitasPorFonteChartProps) => {
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

  const chartData = data.map((item, index) => ({
    name: item.fonte,
    value: item.valor,
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.fonte] = {
      label: item.fonte,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const total = data.reduce((sum, item) => sum + item.valor, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign size={20} />
          Receitas por Fonte
        </CardTitle>
        <CardDescription>Origem das receitas</CardDescription>
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
                innerRadius={80}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
