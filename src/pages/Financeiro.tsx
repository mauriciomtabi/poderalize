import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { DollarSign, TrendingUp, TrendingDown, Building, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  valor_fechamento: number;
  data_fechamento: string;
}

interface Colaborador {
  id: string;
  nome: string;
  funcao: string;
  departamento: string | null;
  salario: number | null;
  status: string;
}

const Financeiro = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar clientes
        const { data: clientesData, error: clientesError } = await supabase
          .from('clientes')
          .select('id, nome, empresa, valor_fechamento, data_fechamento')
          .order('data_fechamento', { ascending: false });

        if (clientesError) throw clientesError;

        // Buscar colaboradores ativos com salário
        const { data: colaboradoresData, error: colaboradoresError } = await supabase
          .from('colaboradores')
          .select('id, nome, funcao, departamento, salario, status')
          .eq('status', 'ativo')
          .order('nome', { ascending: true });

        if (colaboradoresError) throw colaboradoresError;

        setClientes(clientesData || []);
        setColaboradores(colaboradoresData || []);
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalReceitas = clientes.reduce((sum, cliente) => sum + (cliente.valor_fechamento || 0), 0);
  const totalDespesas = colaboradores.reduce((sum, colab) => sum + (colab.salario || 0), 0);
  const saldo = totalReceitas - totalDespesas;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-interactive hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp size={16} className="text-green-600" />
              Receitas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(totalReceitas)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-interactive hover-lift">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown size={16} className="text-red-600" />
              Despesas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(totalDespesas)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {colaboradores.length} {colaboradores.length === 1 ? 'colaborador' : 'colaboradores'}
            </p>
          </CardContent>
        </Card>

        <Card className={`card-interactive hover-lift ${saldo >= 0 ? 'border-green-600/50' : 'border-red-600/50'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign size={16} className={saldo >= 0 ? 'text-green-600' : 'text-red-600'} />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {saldo >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Receitas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building size={20} />
            Receitas - Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma receita registrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Data Fechamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>{cliente.empresa}</TableCell>
                      <TableCell>
                        {format(new Date(cliente.data_fechamento), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {formatCurrency(cliente.valor_fechamento || 0)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Despesas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Despesas - Salários
          </CardTitle>
        </CardHeader>
        <CardContent>
          {colaboradores.filter(c => c.salario && c.salario > 0).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma despesa registrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead className="text-right">Salário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colaboradores
                    .filter(c => c.salario && c.salario > 0)
                    .map((colaborador) => (
                      <TableRow key={colaborador.id}>
                        <TableCell className="font-medium">{colaborador.nome}</TableCell>
                        <TableCell>{colaborador.funcao}</TableCell>
                        <TableCell>
                          {colaborador.departamento ? (
                            <Badge variant="secondary">{colaborador.departamento}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            {formatCurrency(colaborador.salario || 0)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;
