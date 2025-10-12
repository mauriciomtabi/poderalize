import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Flame, Calendar, AlertTriangle, DollarSign, BarChart3 } from "lucide-react";
import { FinancialMetrics } from "@/hooks/useFinancialMetrics";

interface FinancialKPIsProps {
  metrics: FinancialMetrics;
}

export const FinancialKPIs = ({ metrics }: FinancialKPIsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 5) return <TrendingUp className="w-3 h-3 text-green-600" />;
    if (value < -5) return <TrendingDown className="w-3 h-3 text-destructive" />;
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Ticket Médio */}
      <Card className="card-interactive hover-lift">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign size={16} className="text-primary" />
            Ticket Médio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(metrics.ticketMedio)}
            </div>
            {getTrendIcon(metrics.crescimentoMoM)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            por cliente/mês
          </p>
        </CardContent>
      </Card>

      {/* Taxa de Inadimplência */}
      <Card className={`card-interactive hover-lift ${metrics.taxaInadimplencia > 10 ? 'border-destructive/50' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle size={16} className={metrics.taxaInadimplencia > 10 ? 'text-destructive' : 'text-orange-600'} />
            Inadimplência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.taxaInadimplencia > 10 ? 'text-destructive' : 'text-orange-600'}`}>
            {metrics.taxaInadimplencia.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.taxaInadimplencia > 10 ? 'Atenção necessária' : 'Em níveis aceitáveis'}
          </p>
        </CardContent>
      </Card>

      {/* Margem Operacional */}
      <Card className={`card-interactive hover-lift ${metrics.margemOperacional > 30 ? 'border-green-500/50' : ''}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target size={16} className={metrics.margemOperacional > 30 ? 'text-green-600' : 'text-primary'} />
            Margem Operacional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className={`text-2xl font-bold ${metrics.margemOperacional > 30 ? 'text-green-600' : 'text-foreground'}`}>
              {metrics.margemOperacional.toFixed(1)}%
            </div>
            {metrics.margemOperacional > 30 && <span className="text-green-600 text-sm">✓</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.margemOperacional > 30 ? 'Meta atingida!' : 'Meta: 30%'}
          </p>
        </CardContent>
      </Card>

      {/* Burn Rate */}
      <Card className="card-interactive hover-lift">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Flame size={16} className="text-orange-600" />
            Burn Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(metrics.burnRate)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            despesas mensais
          </p>
        </CardContent>
      </Card>

      {/* Crescimento MoM */}
      <Card className={`card-interactive hover-lift ${metrics.crescimentoMoM > 0 ? 'border-green-500/50' : 'border-red-500/50'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {metrics.crescimentoMoM > 0 ? (
              <TrendingUp size={16} className="text-green-600" />
            ) : (
              <TrendingDown size={16} className="text-destructive" />
            )}
            Crescimento MoM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.crescimentoMoM > 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatPercent(metrics.crescimentoMoM)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            vs. mês anterior
          </p>
        </CardContent>
      </Card>

      {/* Previsão 30d */}
      <Card className="card-interactive hover-lift">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            Previsão 30 dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.previsaoCaixa30d > 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatCurrency(metrics.previsaoCaixa30d)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            saldo projetado
          </p>
        </CardContent>
      </Card>

      {/* Tendência Receitas */}
      <Card className="card-interactive hover-lift">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            Tendência Receitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground capitalize">
            {metrics.tendenciaReceitas === 'crescente' ? '📈' : metrics.tendenciaReceitas === 'decrescente' ? '📉' : '➡️'}
            {' '}
            {metrics.tendenciaReceitas}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            últimos 6 meses
          </p>
        </CardContent>
      </Card>

      {/* Previsão 90d */}
      <Card className="card-interactive hover-lift">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            Previsão 90 dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.previsaoCaixa90d > 0 ? 'text-green-600' : 'text-destructive'}`}>
            {formatCurrency(metrics.previsaoCaixa90d)}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            saldo projetado
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
