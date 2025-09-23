import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Zap, Target, Award, Crown, Flame, TrendingUp } from "lucide-react";

interface GamificationBadgesProps {
  badges: string[];
  pontuacao: number;
  nivel?: number;
}

export const GamificationBadges = ({ badges, pontuacao, nivel = 1 }: GamificationBadgesProps) => {
  const badgeConfigs: Record<string, { icon: JSX.Element; color: string; description: string }> = {
    'primeiro_fechamento': {
      icon: <Star className="h-4 w-4" />,
      color: 'bg-yellow-100 text-yellow-700',
      description: 'Primeira venda realizada'
    },
    'vendedor_mes': {
      icon: <Crown className="h-4 w-4" />,
      color: 'bg-purple-100 text-purple-700',
      description: 'Vendedor do mês'
    },
    'meta_batida': {
      icon: <Target className="h-4 w-4" />,
      color: 'bg-green-100 text-green-700',
      description: 'Meta mensal atingida'
    },
    'sequencia_vendas': {
      icon: <Flame className="h-4 w-4" />,
      color: 'bg-red-100 text-red-700',
      description: 'Sequência de 5 vendas'
    },
    'cliente_fidelizado': {
      icon: <Award className="h-4 w-4" />,
      color: 'bg-blue-100 text-blue-700',
      description: 'Cliente fidelizado'
    },
    'conversao_alta': {
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'bg-orange-100 text-orange-700',
      description: 'Taxa de conversão +30%'
    },
    'speed_closer': {
      icon: <Zap className="h-4 w-4" />,
      color: 'bg-cyan-100 text-cyan-700',
      description: 'Fechamento em <24h'
    }
  };

  const getNivelIcon = (nivel: number) => {
    if (nivel >= 10) return <Crown className="h-5 w-5 text-purple-500" />;
    if (nivel >= 5) return <Trophy className="h-5 w-5 text-yellow-500" />;
    return <Star className="h-5 w-5 text-blue-500" />;
  };

  const proximoNivel = nivel * 1000;
  const progressoNivel = (pontuacao % 1000) / 10;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Conquistas Poderalize
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nível e Progresso */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
          <div className="flex items-center gap-2">
            {getNivelIcon(nivel)}
            <div>
              <div className="font-medium">Nível {nivel}</div>
              <div className="text-sm text-muted-foreground">
                {pontuacao} / {proximoNivel} pontos
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{pontuacao}</div>
            <div className="text-xs text-muted-foreground">pontos</div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso para o próximo nível</span>
            <span>{progressoNivel.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressoNivel}%` }}
            />
          </div>
        </div>

        {/* Badges Conquistados */}
        <div className="space-y-3">
          <h4 className="font-medium">Badges Conquistados</h4>
          {badges.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Continue vendendo para conquistar seus primeiros badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {badges.map((badge, index) => {
                const config = badgeConfigs[badge] || {
                  icon: <Star className="h-4 w-4" />,
                  color: 'bg-gray-100 text-gray-700',
                  description: 'Conquista especial'
                };
                
                return (
                  <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                    <div className={`p-2 rounded-full ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm capitalize">
                        {badge.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {config.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Frases Motivacionais */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-3 rounded-lg border-l-4 border-primary">
          <p className="text-sm font-medium text-primary">💪 Frase do Dia</p>
          <p className="text-sm mt-1">
            "Cada 'não' te aproxima do próximo 'sim'. Continue persistindo!"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};