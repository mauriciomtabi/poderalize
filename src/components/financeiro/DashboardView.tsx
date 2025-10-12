import { FinancialKPIs } from "./FinancialKPIs";
import { ReceitasDespesasChart } from "./charts/ReceitasDespesasChart";
import { FluxoCaixaChart } from "./charts/FluxoCaixaChart";
import { DespesasPorCategoriaChart } from "./charts/DespesasPorCategoriaChart";
import { ReceitasPorFonteChart } from "./charts/ReceitasPorFonteChart";
import { EvolucaoMensalChart } from "./charts/EvolucaoMensalChart";
import { useFinancialMetrics } from "@/hooks/useFinancialMetrics";

interface DashboardViewProps {
  selectedYear: string;
  selectedMonth: string;
}

export const DashboardView = ({ selectedYear, selectedMonth }: DashboardViewProps) => {
  const metrics = useFinancialMetrics(selectedYear, selectedMonth);

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
