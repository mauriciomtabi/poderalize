import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Cliente } from "@/hooks/useClientes";
import { format, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, CheckCircle2, Clock, Package } from "lucide-react";

interface ServicosUnicosSectionProps {
  clientes: Cliente[];
  formatCurrency: (value?: number) => string;
  selectedYear: string;
  selectedMonth: string;
}

export const ServicosUnicosSection = ({
  clientes,
  formatCurrency,
  selectedYear,
  selectedMonth
}: ServicosUnicosSectionProps) => {
  
  const getServicoNome = (key: string): string => {
    const nomes: Record<string, string> = {
      criacao_site: 'Criação de Site',
      identidade_visual: 'Identidade Visual',
      plataforma_vendas: 'Plataforma de Vendas',
      outros: 'Outros',
    };
    return nomes[key] || key;
  };

  const getServicoStatus = (servico: any, key: string) => {
    if (!servico.selecionado) return null;
    
    if (servico.pagamento_confirmado) {
      return { status: 'pago', color: 'success', icon: CheckCircle2, label: 'Pago' };
    }
    
    if (servico.data_prevista_pagamento) {
      const hoje = new Date();
      const dataPrevista = new Date(servico.data_prevista_pagamento);
      
      if (isBefore(dataPrevista, hoje)) {
        return { status: 'atrasado', color: 'destructive', icon: AlertTriangle, label: 'Atrasado' };
      }
    }
    
    return { status: 'pendente', color: 'warning', icon: Clock, label: 'Pendente' };
  };

  // Coletar todos os serviços únicos de todos os clientes
  const servicosUnicos: any[] = [];
  
  clientes.forEach(cliente => {
    const servicos = cliente.servicos_unicos;
    if (!servicos) return;

    Object.entries(servicos).forEach(([key, servico]: [string, any]) => {
      if (!servico?.selecionado) return;

      // Filtrar por período
      let incluirServico = true;
      
      if (selectedMonth !== 'all') {
        const dataPagamento = servico.pagamento_confirmado 
          ? servico.data_pagamento 
          : servico.data_prevista_pagamento;
        
        if (dataPagamento) {
          const dataServico = new Date(dataPagamento);
          const ano = dataServico.getFullYear();
          const mes = dataServico.getMonth() + 1;
          
          incluirServico = ano === parseInt(selectedYear) && mes === parseInt(selectedMonth);
        }
      }

      if (incluirServico) {
        servicosUnicos.push({
          cliente: cliente.nome,
          empresa: cliente.empresa,
          tipo: key,
          tipoNome: servico.descricao && key === 'outros' ? servico.descricao : getServicoNome(key),
          valor: servico.valor || 0,
          data_contratacao: servico.data_contratacao,
          data_entrega: servico.data_entrega,
          pagamento_confirmado: servico.pagamento_confirmado,
          data_pagamento: servico.data_pagamento,
          data_prevista_pagamento: servico.data_prevista_pagamento,
          status: getServicoStatus(servico, key),
        });
      }
    });
  });

  // Calcular totais
  const totalServicos = servicosUnicos.length;
  const servicosPagos = servicosUnicos.filter(s => s.pagamento_confirmado).length;
  const servicosPendentes = servicosUnicos.filter(s => !s.pagamento_confirmado && s.status?.status === 'pendente').length;
  const servicosAtrasados = servicosUnicos.filter(s => s.status?.status === 'atrasado').length;
  
  const valorTotal = servicosUnicos.reduce((sum, s) => sum + s.valor, 0);
  const valorPago = servicosUnicos.filter(s => s.pagamento_confirmado).reduce((sum, s) => sum + s.valor, 0);
  const valorPendente = servicosUnicos.filter(s => !s.pagamento_confirmado).reduce((sum, s) => sum + s.valor, 0);

  if (totalServicos === 0) return null;

  return (
    <div className="space-y-4">
      {/* Cabeçalho da Seção */}
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Serviços Únicos</h3>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServicos}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(valorTotal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold">{servicosPagos}</div>
            </div>
            <p className="text-xs text-green-600 font-medium mt-1">{formatCurrency(valorPago)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div className="text-2xl font-bold">{servicosPendentes}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(valorPendente)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="text-2xl font-bold">{servicosAtrasados}</div>
            </div>
            <p className="text-xs text-red-600 font-medium mt-1">Requer atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento de Serviços Únicos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Contratação</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicosUnicos.map((servico, index) => {
                const StatusIcon = servico.status?.icon || Clock;
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{servico.cliente}</div>
                        <div className="text-sm text-muted-foreground">{servico.empresa}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{servico.tipoNome}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(servico.valor)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {servico.data_contratacao
                        ? format(new Date(servico.data_contratacao), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {servico.data_entrega
                        ? format(new Date(servico.data_entrega), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {servico.pagamento_confirmado && servico.data_pagamento
                        ? format(new Date(servico.data_pagamento), 'dd/MM/yyyy', { locale: ptBR })
                        : servico.data_prevista_pagamento
                        ? `Prev: ${format(new Date(servico.data_prevista_pagamento), 'dd/MM/yyyy', { locale: ptBR })}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {servico.status && (
                        <Badge variant={servico.status.color as any} className="flex items-center gap-1 w-fit">
                          <StatusIcon className="h-3 w-3" />
                          {servico.status.label}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
