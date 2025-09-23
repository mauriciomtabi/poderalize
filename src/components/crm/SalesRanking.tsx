import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target, Award } from "lucide-react";
import { SalesMetrics } from "@/types/crm";

interface SalesRankingProps {
  salesData: SalesMetrics[];
}

export const SalesRanking = ({ salesData }: SalesRankingProps) => {
  const sortedSales = salesData.sort((a, b) => b.pontuacao - a.pontuacao);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Award className="h-5 w-5 text-gray-400" />;
      case 2: return <Target className="h-5 w-5 text-orange-500" />;
      default: return <TrendingUp className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getAtendimentoColor = (tipo: string) => {
    switch (tipo) {
      case 'escuta_ativa': return 'bg-green-100 text-green-700';
      case 'venda_consultiva': return 'bg-blue-100 text-blue-700';
      case 'venda_forcada': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Ranking de Vendedores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedSales.map((vendedor, index) => (
            <div key={vendedor.vendedorId} className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getRankIcon(index)}
                <span className="font-bold text-lg">#{index + 1}</span>
              </div>
              
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {vendedor.vendedorNome.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{vendedor.vendedorNome}</h4>
                  <Badge variant="secondary" className="font-bold">
                    {vendedor.pontuacao} pts
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{vendedor.conversoes}/{vendedor.leadsAtendidos} conversões</span>
                  <span>{vendedor.taxaConversao.toFixed(1)}%</span>
                  <span>R$ {vendedor.receitaGerada.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-1 rounded text-xs ${getAtendimentoColor(vendedor.tipoAtendimento)}`}>
                    {vendedor.tipoAtendimento.replace('_', ' ')}
                  </div>
                  
                  {vendedor.badges.map((badge, badgeIndex) => (
                    <Badge key={badgeIndex} variant="outline" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};