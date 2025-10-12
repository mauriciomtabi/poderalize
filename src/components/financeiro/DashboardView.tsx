import { FinancialKPIs } from "./FinancialKPIs";
import { ReceitasDespesasChart } from "./charts/ReceitasDespesasChart";
import { FluxoCaixaChart } from "./charts/FluxoCaixaChart";
import { DespesasPorCategoriaChart } from "./charts/DespesasPorCategoriaChart";
import { ReceitasPorFonteChart } from "./charts/ReceitasPorFonteChart";
import { EvolucaoMensalChart } from "./charts/EvolucaoMensalChart";
import { useFinancialMetrics } from "@/hooks/useFinancialMetrics";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface DashboardViewProps {
  selectedYear: string;
  selectedMonth: string;
}

export const DashboardView = ({ selectedYear, selectedMonth }: DashboardViewProps) => {
  const metrics = useFinancialMetrics(selectedYear, selectedMonth);

  const hasData = metrics.historicoReceitas.length > 0 || metrics.historicoDespesas.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <FinancialKPIs metrics={metrics} />

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReceitasDespesasChart 
          receitas={metrics.historicoReceitas} 
          despesas={metrics.historicoDespesas} 
        />
        <FluxoCaixaChart data={metrics.fluxoCaixaAcumulado} />
      </div>

      {/* Gráficos de Distribuição */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <DespesasPorCategoriaChart data={metrics.despesasPorCategoria} />
        <ReceitasPorFonteChart data={metrics.receitasPorFonte} />
        <EvolucaoMensalChart 
          receitas={metrics.historicoReceitas} 
          despesas={metrics.historicoDespesas} 
        />
      </div>
    </div>
  );
};
