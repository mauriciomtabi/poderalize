import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import { RecomendacaoIA } from "@/types/crm";

interface RecommendationEngineProps {
  recomendacoes: RecomendacaoIA[];
  onAplicarSugestao?: (recomendacaoId: string) => void;
}

export const RecommendationEngine = ({ 
  recomendacoes, 
  onAplicarSugestao 
}: RecommendationEngineProps) => {
  const getRecommendationIcon = (tipo: string) => {
    switch (tipo) {
      case 'acao': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'alerta': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'oportunidade': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Lightbulb className="h-4 w-4 text-purple-500" />;
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'destructive';
      case 'media': return 'secondary';
      case 'baixa': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          IA Poderalize - Recomendações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recomendacoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma recomendação no momento</p>
              <p className="text-sm">Continue trabalhando seus leads!</p>
            </div>
          ) : (
            recomendacoes.map((rec) => (
              <div key={rec.leadId} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {getRecommendationIcon(rec.tipo)}
                    <div className="space-y-1">
                      <h4 className="font-medium">{rec.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{rec.descricao}</p>
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(rec.prioridade) as any}>
                    {rec.prioridade}
                  </Badge>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">💡 Sugestão:</p>
                  <p className="text-sm">{rec.sugestao}</p>
                </div>
                
                {onAplicarSugestao && (
                  <Button 
                    size="sm" 
                    onClick={() => onAplicarSugestao(rec.leadId)}
                    className="w-full"
                  >
                    Aplicar Sugestão
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};