import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";

interface ReceitaStatusData {
  mes: string;
  pago: number;
  noPrazo: number;
  atrasado: number;
  projecao: number;
}

interface ReceitasControlChartProps {
  data: ReceitaStatusData[];
  formatCurrency: (value: number) => string;
}

// Função para formatar valores em k (milhares)
const formatToK = (value: number): string => {
  if (value === 0) return '';
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toFixed(0);
};

// Componente para renderizar o label customizado
const CustomLabel = (props: any) => {
  const { x, y, width, value, data, index } = props;
  
  // Calcular o total da coluna (soma de todos os valores empilhados)
  const dataPoint = data[index];
  const total = (dataPoint.pago || 0) + (dataPoint.noPrazo || 0) + 
                (dataPoint.atrasado || 0) + (dataPoint.projecao || 0);
  
  if (total === 0) return null;
  
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="hsl(var(--foreground))"
      textAnchor="middle"
      fontSize="13"
      fontWeight="600"
      className="drop-shadow-sm"
    >
      {formatToK(total)}
    </text>
  );
};

const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, p: any) => sum + p.value, 0);
    
    return (
      <div className="bg-card/95 backdrop-blur-sm p-4 border border-border shadow-xl rounded-xl">
        <p className="font-bold text-card-foreground mb-3 text-base">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex justify-between gap-6 text-sm mb-2">
            <span style={{ color: p.fill }} className="font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: p.fill }}></span>
              {p.name}:
            </span>
            <span className="text-card-foreground font-medium">{formatCurrency(p.value)}</span>
          </div>
        ))}
        <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold text-card-foreground text-base">
          <span>Total:</span>
          <span className="text-primary">{formatCurrency(total)}</span>
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
    noPrazo: acc.noPrazo + item.noPrazo,
    atrasado: acc.atrasado + item.atrasado,
    projecao: acc.projecao + item.projecao,
  }), { pago: 0, noPrazo: 0, atrasado: 0, projecao: 0 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Controle de Receitas por Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Cards de resumo por status - Grid otimizado */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="border-2 border-green-500/30 dark:border-green-600/40 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader className="pb-2 px-4 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <span className="text-lg">✅</span>
                Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-500">
                {formatCurrency(totals.pago)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-500/30 dark:border-yellow-600/40 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardHeader className="pb-2 px-4 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <span className="text-lg">⏳</span>
                No Prazo
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <p className="text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                {formatCurrency(totals.noPrazo)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-500/30 dark:border-red-600/40 bg-red-50/50 dark:bg-red-950/20">
            <CardHeader className="pb-2 px-4 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <span className="text-lg">⚠️</span>
                Atrasado
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <p className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-500">
                {formatCurrency(totals.atrasado)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/30 dark:border-blue-600/40 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader className="pb-2 px-4 pt-3">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <span className="text-lg">📊</span>
                Projeção
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-500">
                {formatCurrency(totals.projecao)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de colunas empilhadas */}
        <ResponsiveContainer width="100%" height={450}>
          <BarChart 
            data={data}
            margin={{ top: 30, right: 20, left: 20, bottom: 5 }}
          >
            <defs>
              {/* Gradientes modernos */}
              <linearGradient id="colorPago" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                <stop offset="100%" stopColor="#059669" stopOpacity={0.9}/>
              </linearGradient>
              <linearGradient id="colorNoPrazo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity={1}/>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.9}/>
              </linearGradient>
              <linearGradient id="colorAtrasado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" stopOpacity={1}/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.9}/>
              </linearGradient>
              <linearGradient id="colorProjecao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity={1}/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.9}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="mes" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '13px', fontWeight: '500' }}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => formatToK(value)}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
            <Legend 
              wrapperStyle={{ fontSize: '14px', fontWeight: '500' }}
              iconType="circle"
            />
            
            {/* Colunas empilhadas com visual moderno */}
            <Bar 
              dataKey="pago" 
              stackId="a" 
              fill="url(#colorPago)" 
              name="Pago" 
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="noPrazo" 
              stackId="a" 
              fill="url(#colorNoPrazo)" 
              name="No Prazo" 
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="atrasado" 
              stackId="a" 
              fill="url(#colorAtrasado)" 
              name="Atrasado" 
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="projecao" 
              stackId="a" 
              fill="url(#colorProjecao)" 
              name="Projeção" 
              radius={[8, 8, 0, 0]}
            >
              {/* Label com o total acima de cada coluna */}
              <LabelList content={<CustomLabel data={data} />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
