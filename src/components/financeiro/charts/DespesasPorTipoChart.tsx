import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { Despesa } from "@/hooks/useDespesas";
import { Colaborador } from "@/types/colaboradores";

interface DespesasPorTipoChartProps {
  despesas: Despesa[];
  colaboradores: Colaborador[];
  totalSalarios: number;
}

export const DespesasPorTipoChart = ({ despesas, colaboradores, totalSalarios }: DespesasPorTipoChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const chartData = useMemo(() => {
    const categoriesMap: Record<string, number> = {};

    // Agregar despesas por categoria
    despesas.forEach(despesa => {
      const categoria = despesa.categoria || 'Outros';
      if (!categoriesMap[categoria]) {
        categoriesMap[categoria] = 0;
      }
      categoriesMap[categoria] += despesa.valor || 0;
    });

    // Adicionar salários como uma categoria
    if (totalSalarios > 0) {
      categoriesMap['Salários'] = totalSalarios;
    }

    // Converter para formato do gráfico e ordenar do maior para o menor
    return Object.entries(categoriesMap)
      .map(([nome, valor]) => ({
        nome,
        valor,
      }))
      .filter(item => item.valor > 0)
      .sort((a, b) => b.valor - a.valor);
  }, [despesas, totalSalarios]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            📊 Despesas por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma despesa no momento
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          📊 Despesas por Tipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 40, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="nome" 
              className="text-sm"
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <YAxis 
              className="text-sm"
              tick={{ fill: 'hsl(var(--foreground))' }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend 
              wrapperStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar 
              dataKey="valor" 
              fill="hsl(var(--destructive))" 
              name="Valor Total"
              radius={[8, 8, 0, 0]}
            >
              <LabelList 
                dataKey="valor" 
                position="top" 
                formatter={(value: number) => formatCurrency(value)}
                style={{ fill: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
