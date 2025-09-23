import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelStep } from "@/types/crm";
import { TrendingDown, Users, Clock, DollarSign } from "lucide-react";

interface FunnelChartProps {
  steps: FunnelStep[];
}

export const FunnelChart = ({ steps }: FunnelChartProps) => {
  const maxQuantidade = Math.max(...steps.map(step => step.quantidade));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-primary" />
          Funil de Vendas Poderalize
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const percentage = (step.quantidade / maxQuantidade) * 100;
            const conversionColor = step.conversao >= 20 ? 'bg-green-500' : 
                                  step.conversao >= 10 ? 'bg-yellow-500' : 'bg-red-500';
            
            return (
              <div key={step.etapa} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{step.etapa}</span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {step.quantidade}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {step.tempoMedio}d
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      R$ {step.receita.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <div 
                    className="h-12 bg-primary/20 rounded-lg flex items-center justify-center relative overflow-hidden"
                    style={{ width: `${percentage}%` }}
                  >
                    <div 
                      className={`absolute inset-0 ${conversionColor} opacity-20 rounded-lg`}
                    />
                    <span className="relative z-10 text-sm font-medium">
                      {step.conversao}% conversão
                    </span>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="flex justify-center">
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};