import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesRanking } from "@/components/crm/SalesRanking";
import { GamificationBadges } from "@/components/crm/GamificationBadges";
import { SalesMetrics } from "@/types/crm";
import { 
  Trophy,
  Target, 
  TrendingUp, 
  Users, 
  DollarSign,
  Award,
  BarChart3,
  Zap,
  Brain,
  MessageSquare,
  Search,
  Filter,
  Calendar
} from "lucide-react";

const Vendas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTempo, setFiltroTempo] = useState("mes");

  // Mock data de vendedores
  const salesData: SalesMetrics[] = [
    {
      vendedorId: "1",
      vendedorNome: "João Silva",
      leadsAtendidos: 45,
      conversoes: 12,
      taxaConversao: 26.7,
      receitaGerada: 85000,
      tempoMedioFechamento: 7,
      tipoAtendimento: "venda_consultiva",
      pontuacao: 1250,
      badges: ["vendedor_mes", "meta_batida", "conversao_alta"]
    },
    {
      vendedorId: "2", 
      vendedorNome: "Maria Santos",
      leadsAtendidos: 38,
      conversoes: 15,
      taxaConversao: 39.5,
      receitaGerada: 92000,
      tempoMedioFechamento: 5,
      tipoAtendimento: "escuta_ativa",
      pontuacao: 1580,
      badges: ["primeiro_fechamento", "speed_closer", "cliente_fidelizado"]
    },
    {
      vendedorId: "3",
      vendedorNome: "Pedro Costa", 
      leadsAtendidos: 52,
      conversoes: 8,
      taxaConversao: 15.4,
      receitaGerada: 45000,
      tempoMedioFechamento: 12,
      tipoAtendimento: "venda_forcada",
      pontuacao: 780,
      badges: ["sequencia_vendas"]
    },
    {
      vendedorId: "4",
      vendedorNome: "Ana Lima",
      leadsAtendidos: 33,
      conversoes: 11,
      taxaConversao: 33.3,
      receitaGerada: 67000,
      tempoMedioFechamento: 6,
      tipoAtendimento: "venda_consultiva", 
      pontuacao: 1120,
      badges: ["meta_batida", "conversao_alta"]
    }
  ];

  // Estatísticas gerais
  const estatisticasGerais = {
    totalVendedores: salesData.length,
    totalConversoes: salesData.reduce((acc, curr) => acc + curr.conversoes, 0),
    receitaTotal: salesData.reduce((acc, curr) => acc + curr.receitaGerada, 0),
    taxaConversaoMedia: salesData.reduce((acc, curr) => acc + curr.taxaConversao, 0) / salesData.length
  };

  // Biblioteca de objeções
  const objecoesPorNicho = [
    {
      categoria: "Preço",
      objections: [
        {
          objeto: "Está muito caro",
          resposta: "Entendo sua preocupação. Vamos analisar o investimento versus o retorno que você terá..."
        },
        {
          objeto: "Preciso pensar",
          resposta: "Claro! O que especificamente você gostaria de analisar? Posso ajudar com essas dúvidas agora mesmo."
        }
      ]
    },
    {
      categoria: "Confiança", 
      objections: [
        {
          objeto: "Não conheço a empresa",
          resposta: "Perfeito! Deixe-me compartilhar alguns cases de sucesso de clientes similares ao seu perfil..."
        },
        {
          objeto: "E se não funcionar?",
          resposta: "Essa é uma preocupação válida. Por isso oferecemos garantia total de 30 dias..."
        }
      ]
    },
    {
      categoria: "Timing",
      objections: [
        {
          objeto: "Não é o momento certo",
          resposta: "Entendo. Me ajude a entender: o que precisa acontecer para ser o momento ideal?"
        }
      ]
    }
  ];

  const feedbacksAutomaticos = [
    {
      vendedor: "Pedro Costa",
      feedback: "Taxa de conversão baixa (15.4%). Sugestão: Focar mais na escuta ativa e identificação de necessidades reais.",
      prioridade: "alta"
    },
    {
      vendedor: "João Silva", 
      feedback: "Tempo de fechamento acima da média (7 dias). Considere criar mais urgência na apresentação.",
      prioridade: "media"
    },
    {
      vendedor: "Ana Lima",
      feedback: "Excelente performance! Continue aplicando a venda consultiva - está gerando ótimos resultados.",
      prioridade: "baixa"
    }
  ];

  return (
    <div className="space-y-6">
        {/* Header com Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vendedores Ativos</p>
                  <p className="text-2xl font-bold">{estatisticasGerais.totalVendedores}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversões Total</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticasGerais.totalConversoes}</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-orange-600">
                    R$ {estatisticasGerais.receitaTotal.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Conversão Média</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {estatisticasGerais.taxaConversaoMedia.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs defaultValue="ranking" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="objecoes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Objeções
            </TabsTrigger>
            <TabsTrigger value="feedbacks" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Feedbacks IA
            </TabsTrigger>
            <TabsTrigger value="gamificacao" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Gamificação
            </TabsTrigger>
          </TabsList>

          {/* Ranking de Vendedores */}
          <TabsContent value="ranking" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Ranking de Performance</h2>
              <div className="flex gap-2">
                {['semana', 'mes', 'trimestre'].map((periodo) => (
                  <Badge 
                    key={periodo}
                    variant={filtroTempo === periodo ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFiltroTempo(periodo)}
                  >
                    {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
            <SalesRanking salesData={salesData} />
          </TabsContent>

          {/* Biblioteca de Objeções */}
          <TabsContent value="objecoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Biblioteca de Objeções Poderalize
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {objecoesPorNicho.map((categoria, index) => (
                    <div key={index} className="space-y-3">
                      <h3 className="font-semibold text-lg border-b pb-2">{categoria.categoria}</h3>
                      <div className="grid gap-4">
                        {categoria.objections.map((objection, objIndex) => (
                          <div key={objIndex} className="p-4 border rounded-lg space-y-2">
                            <div className="flex items-start justify-between">
                              <p className="font-medium text-red-600">
                                "#{objection.objeto}"
                              </p>
                              <Button size="sm" variant="outline">
                                Copiar Resposta
                              </Button>
                            </div>
                            <p className="text-sm text-green-700 bg-green-50 p-3 rounded">
                              💡 <strong>Resposta Poderalize:</strong> {objection.resposta}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedbacks Automáticos */}
          <TabsContent value="feedbacks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Feedbacks Automáticos da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbacksAutomaticos.map((feedback, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{feedback.vendedor}</h4>
                        <Badge variant={
                          feedback.prioridade === 'alta' ? 'destructive' :
                          feedback.prioridade === 'media' ? 'secondary' : 'outline'
                        }>
                          {feedback.prioridade}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{feedback.feedback}</p>
                      <Button size="sm" className="mt-2">
                        Aplicar Sugestão
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sistema de Gamificação */}
          <TabsContent value="gamificacao" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {salesData.slice(0, 2).map((vendedor) => (
                <GamificationBadges 
                  key={vendedor.vendedorId}
                  badges={vendedor.badges}
                  pontuacao={vendedor.pontuacao}
                  nivel={Math.floor(vendedor.pontuacao / 500) + 1}
                />
              ))}
            </div>

            {/* Mural de Motivação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Mural de Conquistas da Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400 rounded-lg">
                    <p className="font-medium text-yellow-800">🏆 Maria Santos conquistou o badge "Speed Closer"!</p>
                    <p className="text-sm text-yellow-700">Fechou negócio em menos de 24 horas</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-400 rounded-lg">
                    <p className="font-medium text-green-800">💪 João Silva bateu a meta mensal!</p>
                    <p className="text-sm text-green-700">15 dias antes do prazo - Inspirador!</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400 rounded-lg">
                    <p className="font-medium text-blue-800">🎯 Ana Lima mantém 33% de conversão!</p>
                    <p className="text-sm text-blue-700">Consistência é a chave do sucesso</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  export default Vendas;