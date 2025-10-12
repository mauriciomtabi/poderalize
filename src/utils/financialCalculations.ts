import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface MonthlyData {
  mes: string;
  ano: number;
  mesNumero: number;
  valor: number;
}

export interface CategoryData {
  categoria: string;
  valor: number;
  cor?: string;
}

export interface SourceData {
  fonte: string;
  valor: number;
}

export const FINANCIAL_COLORS = {
  receitas: {
    primary: 'hsl(var(--chart-1))',
    light: 'hsl(var(--chart-2))',
  },
  despesas: {
    primary: 'hsl(var(--destructive))',
    light: 'hsl(var(--destructive) / 0.6)',
  },
  categories: [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ],
};

// Agregar dados por mês
export const aggregateByMonth = <T extends { [key: string]: any }>(
  data: T[],
  dateField: string,
  valueField: string,
  months: number = 12
): MonthlyData[] => {
  const today = new Date();
  const startDate = subMonths(startOfMonth(today), months - 1);
  const monthsRange = eachMonthOfInterval({ start: startDate, end: today });

  const monthlyMap = new Map<string, number>();

  // Inicializar todos os meses com valor 0
  monthsRange.forEach(month => {
    const key = format(month, 'yyyy-MM');
    monthlyMap.set(key, 0);
  });

  // Agregar valores
  data.forEach(item => {
    const date = new Date(item[dateField]);
    const key = format(date, 'yyyy-MM');
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, monthlyMap.get(key)! + Number(item[valueField]));
    }
  });

  // Converter para array
  return Array.from(monthlyMap.entries()).map(([key, valor]) => {
    const [ano, mes] = key.split('-');
    return {
      mes: format(new Date(parseInt(ano), parseInt(mes) - 1), 'MMM/yy', { locale: ptBR }),
      ano: parseInt(ano),
      mesNumero: parseInt(mes),
      valor,
    };
  });
};

// Calcular fluxo de caixa acumulado
export const calculateCumulativeCashFlow = (
  receitas: MonthlyData[],
  despesas: MonthlyData[]
): MonthlyData[] => {
  let accumulated = 0;
  return receitas.map((rec, index) => {
    const desp = despesas[index];
    accumulated += rec.valor - (desp?.valor || 0);
    return {
      mes: rec.mes,
      ano: rec.ano,
      mesNumero: rec.mesNumero,
      valor: accumulated,
    };
  });
};

// Agregar por categoria
export const aggregateByCategory = <T extends { [key: string]: any }>(
  data: T[],
  categoryField: string,
  valueField: string
): CategoryData[] => {
  const categoryMap = new Map<string, number>();

  data.forEach(item => {
    const category = item[categoryField] || 'Sem categoria';
    const currentValue = categoryMap.get(category) || 0;
    categoryMap.set(category, currentValue + Number(item[valueField]));
  });

  return Array.from(categoryMap.entries())
    .map(([categoria, valor], index) => ({
      categoria,
      valor,
      cor: FINANCIAL_COLORS.categories[index % FINANCIAL_COLORS.categories.length],
    }))
    .sort((a, b) => b.valor - a.valor);
};

// Calcular variação MoM (Month over Month)
export const calculateMoMGrowth = (
  currentMonthValue: number,
  previousMonthValue: number
): number => {
  if (previousMonthValue === 0) return currentMonthValue > 0 ? 100 : 0;
  return ((currentMonthValue - previousMonthValue) / previousMonthValue) * 100;
};

// Calcular média móvel
export const calculateMovingAverage = (data: MonthlyData[], window: number = 3): MonthlyData[] => {
  return data.map((item, index) => {
    if (index < window - 1) {
      return { ...item, valor: item.valor };
    }
    const sum = data.slice(index - window + 1, index + 1).reduce((acc, curr) => acc + curr.valor, 0);
    return { ...item, valor: sum / window };
  });
};

// Calcular tendência (crescente/decrescente)
export const calculateTrend = (data: MonthlyData[]): 'crescente' | 'decrescente' | 'estavel' => {
  if (data.length < 2) return 'estavel';
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, item) => sum + item.valor, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, item) => sum + item.valor, 0) / secondHalf.length;
  
  const diff = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (diff > 5) return 'crescente';
  if (diff < -5) return 'decrescente';
  return 'estavel';
};

// Projetar valor futuro baseado em média histórica
export const projectFutureValue = (historicalData: MonthlyData[], daysAhead: number): number => {
  if (historicalData.length === 0) return 0;
  
  const avgMonthly = historicalData.reduce((sum, item) => sum + item.valor, 0) / historicalData.length;
  const monthsAhead = daysAhead / 30;
  
  return avgMonthly * monthsAhead;
};
