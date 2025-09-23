import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, MessageSquare, Target } from "lucide-react";

interface EmotionalProfileProps {
  travaEmocional: string;
  tipoDiscurso: string;
  necessidadeOculta: string[];
}

export const EmotionalProfile = ({ 
  travaEmocional, 
  tipoDiscurso, 
  necessidadeOculta 
}: EmotionalProfileProps) => {
  const getTravaConfig = (trava: string) => {
    const configs: Record<string, { label: string; color: string; icon: JSX.Element }> = {
      'inseguranca_financeira': {
        label: 'Insegurança Financeira',
        color: 'bg-red-100 text-red-700',
        icon: <Target className="h-4 w-4" />
      },
      'medo_dar_errado': {
        label: 'Medo de dar errado',
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Brain className="h-4 w-4" />
      },
      'falta_apoio': {
        label: 'Falta de Apoio',
        color: 'bg-blue-100 text-blue-700',
        icon: <Heart className="h-4 w-4" />
      },
      'falta_tempo': {
        label: 'Falta de Tempo',
        color: 'bg-purple-100 text-purple-700',
        icon: <MessageSquare className="h-4 w-4" />
      },
      'desconfianca': {
        label: 'Desconfiança',
        color: 'bg-gray-100 text-gray-700',
        icon: <Target className="h-4 w-4" />
      }
    };
    return configs[trava] || configs['falta_apoio'];
  };

  const getDiscursoConfig = (tipo: string) => {
    const configs: Record<string, { label: string; variant: any }> = {
      'tecnico': { label: 'Discurso Técnico', variant: 'secondary' },
      'emocional': { label: 'Discurso Emocional', variant: 'destructive' },
      'inspirador': { label: 'Discurso Inspirador', variant: 'default' }
    };
    return configs[tipo] || configs['tecnico'];
  };

  const travaConfig = getTravaConfig(travaEmocional);
  const discursoConfig = getDiscursoConfig(tipoDiscurso);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Perfil Emocional Poderalize
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Trava Emocional</label>
          <div className={`mt-1 px-2 py-1 rounded-md text-xs flex items-center gap-1 ${travaConfig.color}`}>
            {travaConfig.icon}
            {travaConfig.label}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Tipo de Discurso</label>
          <div className="mt-1">
            <Badge variant={discursoConfig.variant} className="text-xs">
              {discursoConfig.label}
            </Badge>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Necessidades Ocultas</label>
          <div className="mt-1 flex flex-wrap gap-1">
            {necessidadeOculta.map((necessidade, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {necessidade}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};