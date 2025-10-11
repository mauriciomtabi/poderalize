import { useState } from "react";
import { useClientes } from "@/hooks/useClientes";
import { useColaboradores } from "@/hooks/useColaboradores";
import { useDespesas } from "@/hooks/useDespesas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Calendar, Building, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DespesaForm } from "@/components/financeiro/DespesaForm";
import { CreateDespesaData } from "@/hooks/useDespesas";

const Financeiro = () => {
  const { clientes, isLoading: loadingClientes } = useClientes();
  const { colaboradores, loading: loadingColaboradores } = useColaboradores();
  const { despesas, isLoading: loadingDespesas, addDespesa, deleteDespesa } = useDespesas();
  const [isAddDespesaOpen, setIsAddDespesaOpen] = useState(false);

  const loading = loadingClientes || loadingColaboradores || loadingDespesas;

  // Calculate totals
  const totalReceitas = clientes.reduce((sum, cliente) => sum + (cliente.valor_fechamento || 0), 0);
  const totalSalarios = colaboradores
    .filter(c => c.status === "ativo")
    .reduce((sum, colaborador) => sum + (colaborador.salario || 0), 0);
  const totalDespesasOutras = despesas.reduce((sum, despesa) => sum + despesa.valor, 0);
  const totalDespesas = totalSalarios + totalDespesasOutras;
  const saldo = totalReceitas - totalDespesas;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleAddDespesa = async (despesaData: CreateDespesaData) => {
    const success = await addDespesa(despesaData);
    if (success) {
      setIsAddDespesaOpen(false);
    }
  };

  const handleDeleteDespesa = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      await deleteDespesa(id);
    }
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
              Salários + Outras despesas
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

      {/* Receitas - Clientes */}
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
              Nenhum cliente cadastrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Data/Dia Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>{cliente.empresa}</TableCell>
                      <TableCell>
                        {cliente.pagamento_mensal ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              Todo dia {cliente.dia_pagamento}
                            </Badge>
                          </div>
                        ) : (
                          format(new Date(cliente.data_fechamento), "dd/MM/yyyy", { locale: ptBR })
                        )}
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

      {/* Despesas - Salários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Despesas - Salários dos Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {colaboradores.filter(c => c.status === "ativo" && c.salario && c.salario > 0).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum colaborador ativo com salário
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead className="text-right">Salário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colaboradores
                    .filter(c => c.status === "ativo" && c.salario && c.salario > 0)
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

      {/* Outras Despesas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown size={20} />
            Outras Despesas
          </CardTitle>
          <Button onClick={() => setIsAddDespesaOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Lançar Despesa
          </Button>
        </CardHeader>
        <CardContent>
          {despesas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma despesa lançada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {despesas.map((despesa) => (
                    <TableRow key={despesa.id}>
                      <TableCell className="font-medium">{despesa.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{despesa.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(despesa.data), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          {formatCurrency(despesa.valor)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDespesa(despesa.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Adicionar Despesa */}
      <Dialog open={isAddDespesaOpen} onOpenChange={setIsAddDespesaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lançar Nova Despesa</DialogTitle>
          </DialogHeader>
          <DespesaForm 
            onSubmit={handleAddDespesa}
            onCancel={() => setIsAddDespesaOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Financeiro;
