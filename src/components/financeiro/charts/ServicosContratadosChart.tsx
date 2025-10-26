import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Cliente } from "@/hooks/useClientes";

interface ServicosContratadosChartProps {
  clientes: Cliente[];
  paymentFilter: 'total' | 'dinheiro' | 'permuta';
}

export const ServicosContratadosChart = ({ clientes, paymentFilter }: ServicosContratadosChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const chartData = useMemo(() => {
    const servicesMap: Record<string, { dinheiro: number; permuta: number }> = {
      'Social Media': { dinheiro: 0, permuta: 0 },
      'Tráfego Pago': { dinheiro: 0, permuta: 0 },
      'Treinamento': { dinheiro: 0, permuta: 0 },
      'Google Ads': { dinheiro: 0, permuta: 0 },
      'Assinatura Jornada': { dinheiro: 0, permuta: 0 },
    };

    // Agregar valores de serviços recorrentes de clientes ativos
    clientes.forEach(cliente => {
      if (cliente.status === 'inativo') return;
      
      const servicos = cliente.servicos_recorrentes || {};

      // Social Media
      if (servicos.social_media?.ativo) {
        const modo = servicos.social_media.modo_pagamento || 'dinheiro';
        if (modo === 'dinheiro') {
          servicesMap['Social Media'].dinheiro += servicos.social_media.valor || 0;
        } else if (modo === 'permuta') {
          servicesMap['Social Media'].permuta += servicos.social_media.valor_permuta || servicos.social_media.valor || 0;
        } else if (modo === 'dinheiro_permuta') {
          servicesMap['Social Media'].dinheiro += servicos.social_media.valor_dinheiro || 0;
          servicesMap['Social Media'].permuta += servicos.social_media.valor_permuta || 0;
        }
      }

      // Tráfego Pago
      if (servicos.trafego_pago?.ativo) {
        const modo = servicos.trafego_pago.modo_pagamento || 'dinheiro';
        if (modo === 'dinheiro') {
          servicesMap['Tráfego Pago'].dinheiro += servicos.trafego_pago.valor || 0;
        } else if (modo === 'permuta') {
          servicesMap['Tráfego Pago'].permuta += servicos.trafego_pago.valor_permuta || servicos.trafego_pago.valor || 0;
        } else if (modo === 'dinheiro_permuta') {
          servicesMap['Tráfego Pago'].dinheiro += servicos.trafego_pago.valor_dinheiro || 0;
          servicesMap['Tráfego Pago'].permuta += servicos.trafego_pago.valor_permuta || 0;
        }
      }

      // Treinamento de Vendas
      if (servicos.treinamento_vendas?.ativo) {
        const modo = servicos.treinamento_vendas.modo_pagamento || 'dinheiro';
        if (modo === 'dinheiro') {
          servicesMap['Treinamento'].dinheiro += servicos.treinamento_vendas.valor || 0;
        } else if (modo === 'permuta') {
          servicesMap['Treinamento'].permuta += servicos.treinamento_vendas.valor_permuta || servicos.treinamento_vendas.valor || 0;
        } else if (modo === 'dinheiro_permuta') {
          servicesMap['Treinamento'].dinheiro += servicos.treinamento_vendas.valor_dinheiro || 0;
          servicesMap['Treinamento'].permuta += servicos.treinamento_vendas.valor_permuta || 0;
        }
      }

      // Google Ads
      if (servicos.google_ads?.ativo) {
        const modo = servicos.google_ads.modo_pagamento || 'dinheiro';
        if (modo === 'dinheiro') {
          servicesMap['Google Ads'].dinheiro += servicos.google_ads.valor || 0;
        } else if (modo === 'permuta') {
          servicesMap['Google Ads'].permuta += servicos.google_ads.valor_permuta || servicos.google_ads.valor || 0;
        } else if (modo === 'dinheiro_permuta') {
          servicesMap['Google Ads'].dinheiro += servicos.google_ads.valor_dinheiro || 0;
          servicesMap['Google Ads'].permuta += servicos.google_ads.valor_permuta || 0;
        }
      }

      // Assinatura Jornada
      if (servicos.assinatura_jornada?.ativo) {
        const modo = servicos.assinatura_jornada.modo_pagamento || 'dinheiro';
        if (modo === 'dinheiro') {
          servicesMap['Assinatura Jornada'].dinheiro += servicos.assinatura_jornada.valor || 0;
        } else if (modo === 'permuta') {
          servicesMap['Assinatura Jornada'].permuta += servicos.assinatura_jornada.valor_permuta || servicos.assinatura_jornada.valor || 0;
        } else if (modo === 'dinheiro_permuta') {
          servicesMap['Assinatura Jornada'].dinheiro += servicos.assinatura_jornada.valor_dinheiro || 0;
          servicesMap['Assinatura Jornada'].permuta += servicos.assinatura_jornada.valor_permuta || 0;
        }
      }
    });

    // Converter para formato do gráfico aplicando filtro
    return Object.entries(servicesMap).map(([nome, valores]) => {
      let valor = 0;
      if (paymentFilter === 'total') {
        valor = valores.dinheiro + valores.permuta;
      } else if (paymentFilter === 'dinheiro') {
        valor = valores.dinheiro;
      } else if (paymentFilter === 'permuta') {
        valor = valores.permuta;
      }
      
      return {
        nome,
        valor,
        dinheiro: valores.dinheiro,
        permuta: valores.permuta,
      };
    }).filter(item => item.valor > 0); // Mostrar apenas serviços com valores
  }, [clientes, paymentFilter]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            📊 Serviços Contratados por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum serviço contratado no momento
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          📊 Serviços Contratados por Tipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 40, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="nome" 
              tick={false}
              axisLine={false}
            />
            <YAxis 
              className="text-sm"
              tick={{ fill: 'hsl(var(--foreground))' }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend 
              wrapperStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar 
              dataKey="valor" 
              fill="hsl(var(--primary))" 
              name="Valor Total"
              radius={[8, 8, 0, 0]}
            >
              <LabelList 
                dataKey="nome" 
                position="top" 
                style={{ 
                  fill: 'hsl(var(--foreground))',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
