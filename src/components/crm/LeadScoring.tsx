import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Zap, TrendingUp } from "lucide-react";

interface LeadScoringProps {
  pontuacao: number;
  status: 'frio' | 'morno' | 'quente';
  fatores?: string[];
}

export const LeadScoring = ({ pontuacao, status, fatores = [] }: LeadScoringProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'quente':
        return {
          color: 'bg-red-500',
          icon: <Zap className="h-4 w-4" />,
          text: 'Quente',
          variant: 'destructive' as const
        };
      case 'morno':
        return {
          color: 'bg-yellow-500',
          icon: <TrendingUp className="h-4 w-4" />,
          text: 'Morno',
          variant: 'secondary' as const
        };
      default:
        return {
          color: 'bg-blue-500',
          icon: <Star className="h-4 w-4" />,
          text: 'Frio',
          variant: 'outline' as const
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={statusConfig.variant} className="flex items-center gap-1">
            {statusConfig.icon}
            {statusConfig.text}
          </Badge>
          <span className="text-2xl font-bold">{pontuacao}/100</span>
        </div>
      </div>
      
      <Progress value={pontuacao} className="h-2" />
      
      {fatores.length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          <span className="font-medium">Fatores de Pontuação:</span>
          <div className="flex flex-wrap gap-1">
            {fatores.map((fator, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {fator}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};