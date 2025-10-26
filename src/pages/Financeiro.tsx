import { useState, useMemo } from "react";
import { useClientes } from "@/hooks/useClientes";
import { useColaboradores } from "@/hooks/useColaboradores";
import { useDespesas } from "@/hooks/useDespesas";
import { useReceitas } from "@/hooks/useReceitas";
import { usePagamentosClientes } from "@/hooks/usePagamentosClientes";
import { usePagamentosSalarios } from "@/hooks/usePagamentosSalarios";
import { useReceitasControl } from "@/hooks/useReceitasControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DollarSign, TrendingUp, TrendingDown, Plus, Trash2, Calendar, Building, Users, CheckCircle2, Clock, AlertTriangle, AlertCircle, BarChart3 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format, isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DespesaForm } from "@/components/financeiro/DespesaForm";
import { ReceitaForm } from "@/components/financeiro/ReceitaForm";
import { ConfirmPaymentDialog } from "@/components/financeiro/ConfirmPaymentDialog";
import { ConfirmSalaryPaymentDialog } from "@/components/financeiro/ConfirmSalaryPaymentDialog";
import { SectionDivider } from "@/components/financeiro/SectionDivider";
import { CreateDespesaData } from "@/hooks/useDespesas";
import { CreateReceitaData } from "@/hooks/useReceitas";
import { Cliente } from "@/hooks/useClientes";
import { Colaborador } from "@/types/colaboradores";
import { ServicosUnicosSection } from "@/components/financeiro/ServicosUnicosSection";
import { ServicosContratadosChart } from "@/components/financeiro/charts/ServicosContratadosChart";
import { DespesasPorTipoChart } from "@/components/financeiro/charts/DespesasPorTipoChart";
const Financeiro = () => {
  const {
    clientes,
    isLoading: loadingClientes
  } = useClientes();
  const {
    colaboradores,
    loading: loadingColaboradores
  } = useColaboradores();
  const {
    despesas,
    isLoading: loadingDespesas,
    addDespesa,
    deleteDespesa
  } = useDespesas();
  const {
    receitas,
    isLoading: loadingReceitas,
    addReceita,
    deleteReceita
  } = useReceitas();
  const {
    pagamentos,
    registrarPagamento,
    updatePagamento,
    deletePagamento,
    getPagamentoByPeriodo
  } = usePagamentosClientes();
  const {
    pagamentosSalarios,
    addPagamentoSalario,
    deletePagamentoSalario
  } = usePagamentosSalarios();
  const [isAddDespesaOpen, setIsAddDespesaOpen] = useState(false);
  const [isAddReceitaOpen, setIsAddReceitaOpen] = useState(false);
  const [isConfirmPaymentOpen, setIsConfirmPaymentOpen] = useState(false);
  const [isConfirmSalaryPaymentOpen, setIsConfirmSalaryPaymentOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);

  // Filtros de período
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth.toString());
  const [paymentFilter, setPaymentFilter] = useState<'total' | 'dinheiro' | 'permuta'>('total');
  const loading = loadingClientes || loadingColaboradores || loadingDespesas || loadingReceitas;

  // Anos disponíveis (últimos 5 anos + próximos 2)
  const availableYears = Array.from({
    length: 8
  }, (_, i) => currentYear - 5 + i);

  // Meses
  const months = [{
    value: "all",
    label: "Todos os meses"
  }, {
    value: "1",
    label: "Janeiro"
  }, {
    value: "2",
    label: "Fevereiro"
  }, {
    value: "3",
    label: "Março"
  }, {
    value: "4",
    label: "Abril"
  }, {
    value: "5",
    label: "Maio"
  }, {
    value: "6",
    label: "Junho"
  }, {
    value: "7",
    label: "Julho"
  }, {
    value: "8",
    label: "Agosto"
  }, {
    value: "9",
    label: "Setembro"
  }, {
    value: "10",
    label: "Outubro"
  }, {
    value: "11",
    label: "Novembro"
  }, {
    value: "12",
    label: "Dezembro"
  }];

  // Função para filtrar por período
  const filterByPeriod = <T extends {
    [key: string]: any;
  },>(items: T[], dateField: string): T[] => {
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth() + 1;
      if (selectedYear !== 'all' && itemYear !== parseInt(selectedYear)) {
        return false;
      }
      if (selectedMonth !== 'all' && itemMonth !== parseInt(selectedMonth)) {
        return false;
      }
      return true;
    });
  };

  // Verificar status de pagamento do cliente
  const getPaymentStatus = (cliente: Cliente): 'pago' | 'pendente' | 'atrasado' => {
    if (!cliente.pagamento_mensal) return 'pago'; // Clientes sem pagamento mensal são considerados pagos

    const ano = parseInt(selectedYear);
    const mes = parseInt(selectedMonth);
    const pagamento = getPagamentoByPeriodo(cliente.id, ano, mes);
    if (pagamento?.status === 'pago') return 'pago';

    // Verificar se está atrasado
    const today = new Date();
    const dueDay = cliente.dia_pagamento || 5;
    const dueDate = new Date(ano, mes - 1, dueDay);
    if (isAfter(today, dueDate) && !pagamento) {
      return 'atrasado';
    }
    return 'pendente';
  };

  // Dados filtrados
  const filteredClientes = useMemo(() => {
    // Filtrar apenas clientes ativos
    const clientesAtivos = clientes.filter(c => c.status !== 'inativo');
    if (selectedMonth === 'all') return clientesAtivos;
    return clientesAtivos; // Clientes não são filtrados por período, só seu pagamento
  }, [clientes, selectedMonth]);
  const filteredReceitas = useMemo(() => filterByPeriod(receitas, 'data'), [receitas, selectedYear, selectedMonth]);
  const filteredDespesas = useMemo(() => filterByPeriod(despesas, 'data'), [despesas, selectedYear, selectedMonth]);

  // Calcular breakdown de pagamento recorrente (dinheiro vs permuta)
  const calculateRecurrentPaymentBreakdown = (cliente: Cliente): {
    dinheiro: number;
    permuta: number;
    modo: 'dinheiro' | 'permuta' | 'dinheiro_permuta' | null;
  } => {
    let totalDinheiro = 0;
    let totalPermuta = 0;
    let modoDetectado: 'dinheiro' | 'permuta' | 'dinheiro_permuta' | null = null;

    // Verificar serviços recorrentes
    if (cliente.servicos_recorrentes) {
      const servicos = Object.values(cliente.servicos_recorrentes || {}) as any[];
      servicos.forEach(servico => {
        if (servico?.ativo) {
          const modo = servico.modo_pagamento;
          if (!modoDetectado) modoDetectado = modo;
          if (modo === 'dinheiro' || !modo) {
            totalDinheiro += servico.valor || 0;
          } else if (modo === 'permuta') {
            totalPermuta += servico.valor_permuta || servico.valor || 0;
          } else if (modo === 'dinheiro_permuta') {
            totalDinheiro += servico.valor_dinheiro || 0;
            totalPermuta += servico.valor_permuta || 0;
          }
        }
      });
    }
    return {
      dinheiro: totalDinheiro,
      permuta: totalPermuta,
      modo: modoDetectado
    };
  };

  // Calcular totais de Dinheiro e Permuta separadamente, considerando filtros
  const {
    totalDinheiro,
    totalPermuta,
    totalReceitas
  } = useMemo(() => {
    let dinheiro = 0;
    let permuta = 0;

    // 1. Processar clientes com pagamento recorrente
    filteredClientes.forEach(cliente => {
      if (!cliente.pagamento_mensal) {
        // Cliente sem pagamento mensal - verificar período
        const filtered = filterByPeriod([{
          data_fechamento: cliente.data_fechamento
        }], 'data_fechamento');
        if (filtered.length > 0) {
          const breakdown = calculateRecurrentPaymentBreakdown(cliente);
          dinheiro += breakdown.dinheiro;
          permuta += breakdown.permuta;
        }
        return;
      }

      // Cliente com pagamento mensal
      const breakdown = calculateRecurrentPaymentBreakdown(cliente);
      if (selectedMonth === 'all') {
        // Todos os meses: somar pagamentos confirmados
        const ano = parseInt(selectedYear);
        const pagamentosAno = pagamentos.filter(p => p.cliente_id === cliente.id && p.ano === ano && p.status === 'pago');
        pagamentosAno.forEach(() => {
          dinheiro += breakdown.dinheiro;
          permuta += breakdown.permuta;
        });
      } else {
        // Mês específico
        const ano = parseInt(selectedYear);
        const mes = parseInt(selectedMonth);
        const pagamento = getPagamentoByPeriodo(cliente.id, ano, mes);
        if (pagamento?.status === 'pago') {
          dinheiro += breakdown.dinheiro;
          permuta += breakdown.permuta;
        }
      }
    });

    // 2. Processar receitas manuais (assume como dinheiro)
    const receitasManuais = filteredReceitas.reduce((sum, receita) => sum + receita.valor, 0);
    dinheiro += receitasManuais;

    // 3. Processar serviços únicos filtrados pelo período
    filteredClientes.forEach(cliente => {
      const servicosUnicos = cliente.servicos_unicos || {};
      Object.values(servicosUnicos).forEach((servico: any) => {
        if (!servico?.selecionado) return;
        const dataPagamento = servico.data_prevista_pagamento || servico.data_pagamento;
        if (!dataPagamento) return;
        const filtered = filterByPeriod([{
          data: dataPagamento
        }], 'data');
        if (filtered.length > 0 && servico.pagamento_confirmado) {
          const modoPagamento = servico.modo_pagamento || 'dinheiro';
          if (modoPagamento === 'dinheiro') {
            dinheiro += servico.valor || 0;
          } else if (modoPagamento === 'permuta') {
            permuta += servico.valor_permuta || servico.valor || 0;
          } else if (modoPagamento === 'dinheiro_permuta') {
            dinheiro += servico.valor_dinheiro || 0;
            permuta += servico.valor_permuta || 0;
          }
        }
      });
    });

    // 4. Aplicar filtro de tipo de pagamento para totalReceitas
    let total = 0;
    if (paymentFilter === 'total') {
      total = dinheiro + permuta;
    } else if (paymentFilter === 'dinheiro') {
      total = dinheiro;
    } else if (paymentFilter === 'permuta') {
      total = permuta;
    }
    return {
      totalDinheiro: dinheiro,
      totalPermuta: permuta,
      totalReceitas: total
    };
  }, [filteredClientes, pagamentos, selectedYear, selectedMonth, paymentFilter, filteredReceitas, getPagamentoByPeriodo, calculateRecurrentPaymentBreakdown, filterByPeriod]);

  // Função para verificar se salário foi pago
  const getSalaryPaymentStatus = (colaboradorId: string): 'pago' | 'pendente' => {
    if (selectedMonth === 'all') return 'pendente';
    const ano = parseInt(selectedYear);
    const mes = parseInt(selectedMonth);
    const pagamento = pagamentosSalarios.find(p => p.colaborador_id === colaboradorId && p.ano === ano && p.mes === mes);
    return pagamento ? 'pago' : 'pendente';
  };
  const totalSalarios = useMemo(() => {
    const activeColaboradores = colaboradores.filter(c => c.status === "ativo");
    if (selectedMonth === 'all') {
      // Se for "todos os meses", somar todos os pagamentos registrados
      const pagamentosAno = pagamentosSalarios.filter(p => p.ano === parseInt(selectedYear));
      return pagamentosAno.reduce((sum, p) => sum + p.valor_pago, 0);
    } else {
      // Para mês específico, somar apenas pagamentos confirmados
      const ano = parseInt(selectedYear);
      const mes = parseInt(selectedMonth);
      const pagamentosMes = pagamentosSalarios.filter(p => p.ano === ano && p.mes === mes);
      return pagamentosMes.reduce((sum, p) => sum + p.valor_pago, 0);
    }
  }, [colaboradores, pagamentosSalarios, selectedMonth, selectedYear]);
  const totalDespesasOutras = useMemo(() => filteredDespesas.reduce((sum, despesa) => sum + despesa.valor, 0), [filteredDespesas]);
  const totalDespesas = totalSalarios + totalDespesasOutras;
  const saldo = totalReceitas - totalDespesas;

  // Indicadores de contratos
  const {
    contratosPagos,
    contratosPendentes,
    contratosAtrasados
  } = useMemo(() => {
    if (selectedMonth === 'all' || !selectedMonth) {
      return {
        contratosPagos: 0,
        contratosPendentes: 0,
        contratosAtrasados: 0
      };
    }
    const clientesMensais = filteredClientes.filter(c => c.pagamento_mensal);
    const pagos = clientesMensais.filter(c => getPaymentStatus(c) === 'pago').length;
    const atrasados = clientesMensais.filter(c => getPaymentStatus(c) === 'atrasado').length;
    const pendentes = clientesMensais.filter(c => getPaymentStatus(c) === 'pendente').length;
    return {
      contratosPagos: pagos,
      contratosPendentes: pendentes,
      contratosAtrasados: atrasados
    };
  }, [filteredClientes, selectedYear, selectedMonth, pagamentos, getPagamentoByPeriodo]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  // Usar hook para dados do gráfico de receitas
  const receitasControlData = useReceitasControl(clientes.filter(c => c.status !== 'inativo'), pagamentos, selectedYear, calculateRecurrentPaymentBreakdown, paymentFilter);

  // Detectar clientes com valor_fechamento mas sem serviços configurados
  const clientesSemServicos = useMemo(() => {
    return clientes.filter(cliente => {
      if (cliente.status === 'inativo') return false; // Ignorar inativos
      const hasValorFechamento = (cliente.valor_fechamento || 0) > 0;
      const hasActiveRecurring = Object.values(cliente.servicos_recorrentes || {}).some((s: any) => s?.ativo);
      return hasValorFechamento && !hasActiveRecurring;
    });
  }, [clientes]);
  const handleAddDespesa = async (despesaData: CreateDespesaData) => {
    const success = await addDespesa(despesaData);
    if (success) {
      setIsAddDespesaOpen(false);
    }
  };
  const handleAddReceita = async (receitaData: CreateReceitaData) => {
    try {
      await addReceita(receitaData);
      setIsAddReceitaOpen(false);
    } catch (error) {
      // Error já tratado no hook
    }
  };
  const handleDeleteDespesa = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta despesa?")) {
      await deleteDespesa(id);
    }
  };
  const handleDeleteReceita = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta receita?")) {
      await deleteReceita(id);
    }
  };
  const handleOpenConfirmPayment = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsConfirmPaymentOpen(true);
  };
  const handleConfirmPayment = async (data: {
    valor_pago: number;
    data_pagamento: string;
    observacoes?: string;
  }) => {
    if (!selectedCliente) return;
    const ano = parseInt(selectedYear);
    const mes = parseInt(selectedMonth);
    await registrarPagamento({
      cliente_id: selectedCliente.id,
      ano,
      mes,
      valor_pago: data.valor_pago,
      data_pagamento: data.data_pagamento,
      status: 'pago',
      observacoes: data.observacoes
    });
  };
  const handleOpenConfirmSalaryPayment = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setIsConfirmSalaryPaymentOpen(true);
  };
  const handleConfirmSalaryPayment = async (data: {
    valor_pago: number;
    data_pagamento: string;
    observacoes?: string;
  }) => {
    if (!selectedColaborador) return;
    const ano = parseInt(selectedYear);
    const mes = parseInt(selectedMonth);
    await addPagamentoSalario({
      colaborador_id: selectedColaborador.id,
      ano,
      mes,
      valor_pago: data.valor_pago,
      data_pagamento: data.data_pagamento,
      status: 'pago',
      observacoes: data.observacoes
    });
  };
  const handleTogglePayment = async (cliente: Cliente, currentStatus: 'pago' | 'pendente' | 'atrasado') => {
    const ano = parseInt(selectedYear);
    const mes = parseInt(selectedMonth);
    const pagamento = getPagamentoByPeriodo(cliente.id, ano, mes);
    if (currentStatus === 'pago' && pagamento) {
      // Desmarcar - deletar o pagamento
      await deletePagamento(pagamento.id);
    } else {
      // Marcar como pago - criar ou atualizar pagamento
      const breakdown = calculateRecurrentPaymentBreakdown(cliente);
      const totalValor = breakdown.dinheiro + breakdown.permuta;
      if (pagamento) {
        await updatePagamento(pagamento.id, {
          status: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0],
          valor_pago: totalValor
        });
      } else {
        await registrarPagamento({
          cliente_id: cliente.id,
          ano,
          mes,
          valor_pago: totalValor,
          data_pagamento: new Date().toISOString().split('T')[0],
          status: 'pago'
        });
      }
    }
  };
  const handleToggleSalaryPayment = async (colaborador: Colaborador, currentStatus: 'pago' | 'pendente') => {
    const ano = parseInt(selectedYear);
    const mes = parseInt(selectedMonth);
    const pagamento = pagamentosSalarios.find(p => p.colaborador_id === colaborador.id && p.ano === ano && p.mes === mes);
    if (currentStatus === 'pago' && pagamento) {
      // Desmarcar - deletar o pagamento
      await deletePagamentoSalario(pagamento.id);
    } else {
      // Marcar como pago - criar pagamento
      await addPagamentoSalario({
        colaborador_id: colaborador.id,
        ano,
        mes,
        valor_pago: colaborador.salario,
        data_pagamento: new Date().toISOString().split('T')[0],
        status: 'pago'
      });
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>;
  }
  return <div className="space-y-6 animate-fade-in">
      {/* Filtros de Período */}
      <div className="flex flex-row flex-wrap items-center justify-between bg-card border rounded-lg p-5 gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Calendar size={18} />
          <span>Período:</span>
        </div>
        
        <div className="flex flex-row flex-wrap gap-4 flex-1">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={(value: 'total' | 'dinheiro' | 'permuta') => setPaymentFilter(value)}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Total (Dinheiro + Permuta)</SelectItem>
              <SelectItem value="dinheiro">Somente Dinheiro</SelectItem>
              <SelectItem value="permuta">Somente Permuta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dashboard Cards Principais */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total de Receitas</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                  {formatCurrency(totalReceitas)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total de Despesas</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                  {formatCurrency(totalDespesas)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Saldo</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-red-600 dark:text-red-500'}`}>
                  {formatCurrency(saldo)}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-full ${saldo >= 0 ? 'bg-blue-100 dark:bg-blue-950' : 'bg-red-100 dark:bg-red-950'} flex items-center justify-center`}>
                <DollarSign className={`h-6 w-6 ${saldo >= 0 ? 'text-blue-600 dark:text-blue-500' : 'text-red-600 dark:text-red-500'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Valor Total (Clientes Ativos)</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-500">
                  {formatCurrency(
                    clientes
                      .filter(c => c.status !== 'inativo')
                      .reduce((sum, c) => {
                        const breakdown = calculateRecurrentPaymentBreakdown(c);
                        return sum + breakdown.dinheiro + breakdown.permuta;
                      }, 0)
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Valor Dinheiro</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalDinheiro)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Valor Permuta</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(totalPermuta)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Dashboard, Receitas e Despesas */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <DollarSign size={16} />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="receitas" className="flex items-center gap-2">
            <TrendingUp size={16} />
            Receitas
          </TabsTrigger>
          <TabsTrigger value="despesas" className="flex items-center gap-2">
            <TrendingDown size={16} />
            Despesas
          </TabsTrigger>
        </TabsList>

        {/* TAB DE DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          {/* Controle de Receitas por Status - Cards lado a lado */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📊 Controle de Receitas por Status
            </h3>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <Card className="overflow-hidden border-2 border-green-500/30 dark:border-green-600/40 bg-green-50/50 dark:bg-green-950/20 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                    {formatCurrency(receitasControlData.filter(item => selectedMonth === 'all' ? true : item.mesNumero === parseInt(selectedMonth)).reduce((sum, item) => sum + item.pago, 0))}
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-2 border-yellow-500/30 dark:border-yellow-600/40 bg-yellow-50/50 dark:bg-yellow-950/20 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <span className="text-xl">⏳</span>
                    Pendente
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">
                    {formatCurrency(receitasControlData.filter(item => selectedMonth === 'all' ? true : item.mesNumero === parseInt(selectedMonth)).reduce((sum, item) => sum + item.pendente, 0))}
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border-2 border-red-500/30 dark:border-red-600/40 bg-red-50/50 dark:bg-red-950/20 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    Atrasado
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                    {formatCurrency(receitasControlData.filter(item => selectedMonth === 'all' ? true : item.mesNumero === parseInt(selectedMonth)).reduce((sum, item) => sum + item.atrasado, 0))}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Gráfico de Serviços Contratados */}
          <ServicosContratadosChart 
            clientes={clientes.filter(c => c.status !== 'inativo')} 
            paymentFilter={paymentFilter}
          />

          {/* Gráfico de Despesas por Tipo */}
          <DespesasPorTipoChart 
            despesas={filteredDespesas}
            colaboradores={colaboradores}
            totalSalarios={totalSalarios}
          />
        </TabsContent>

        {/* TAB DE RECEITAS */}
        <TabsContent value="receitas" className="space-y-6 mt-6">

          {/* Receitas - Clientes (Pagamentos Recorrentes) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Building size={20} className="flex-shrink-0" />
            Receitas - Clientes (Pagamentos Recorrentes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClientes.length === 0 ? <div className="text-center py-8 text-muted-foreground">
              Nenhum cliente cadastrado
            </div> : <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Data/Dia Pagamento</TableHead>
                    <TableHead>Status Pagamento</TableHead>
                    <TableHead className="text-right">Valor Dinheiro</TableHead>
                    <TableHead className="text-right">Valor Permuta</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map(cliente => {
                    const status = getPaymentStatus(cliente);
                    const ano = parseInt(selectedYear);
                    const mes = parseInt(selectedMonth);
                    const pagamento = getPagamentoByPeriodo(cliente.id, ano, mes);
                    const breakdown = calculateRecurrentPaymentBreakdown(cliente);
                    const totalValor = pagamento?.valor_pago || cliente.valor_fechamento || 0;
                    return <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>{cliente.empresa}</TableCell>
                        <TableCell>
                          {cliente.pagamento_mensal ? <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                Todo dia {cliente.dia_pagamento}
                              </Badge>
                            </div> : format(new Date(cliente.data_fechamento), "dd/MM/yyyy", {
                          locale: ptBR
                        })}
                        </TableCell>
                        <TableCell>
                          {cliente.pagamento_mensal && selectedMonth !== 'all' ? status === 'pago' ? <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Pago {pagamento && `em ${format(new Date(pagamento.data_pagamento), 'dd/MM')}`}
                              </Badge> : status === 'atrasado' ? <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Atrasado
                              </Badge> : <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge> : <span className="text-muted-foreground text-sm">-</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          {breakdown.dinheiro > 0 ? <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 flex items-center gap-1 w-fit ml-auto">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(breakdown.dinheiro)}
                            </Badge> : <span className="text-muted-foreground text-sm">-</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          {breakdown.permuta > 0 ? <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 flex items-center gap-1 w-fit ml-auto">
                              <DollarSign className="h-3 w-3" />
                              {formatCurrency(breakdown.permuta)}
                            </Badge> : <span className="text-muted-foreground text-sm">-</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={breakdown.modo === 'dinheiro' ? 'bg-green-50 text-green-700 border-green-300' : breakdown.modo === 'permuta' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' : 'bg-blue-50 text-blue-700 border-blue-300'}>
                            {formatCurrency(totalValor)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {cliente.pagamento_mensal && selectedMonth !== 'all' && <div className="flex items-center justify-center">
                              <Switch checked={status === 'pago'} onCheckedChange={() => handleTogglePayment(cliente, status)} />
                            </div>}
                        </TableCell>
                      </TableRow>;
                  })}
                </TableBody>
              </Table>
            </div>}
        </CardContent>
      </Card>

          {/* Serviços Únicos */}
          <ServicosUnicosSection clientes={clientes.filter(c => c.status !== 'inativo')} formatCurrency={formatCurrency} selectedYear={selectedYear} selectedMonth={selectedMonth} />

          {/* Outras Receitas */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp size={20} className="flex-shrink-0" />
                Outras Receitas
              </CardTitle>
              <Button onClick={() => setIsAddReceitaOpen(true)} size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Lançar Receita
              </Button>
            </CardHeader>
            <CardContent>
              {filteredReceitas.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                  Nenhuma receita lançada no período selecionado
                </div> : <div className="overflow-x-auto">
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
                      {filteredReceitas.map(receita => <TableRow key={receita.id}>
                          <TableCell className="font-medium">{receita.descricao}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{receita.categoria}</Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(receita.data), "dd/MM/yyyy", {
                        locale: ptBR
                      })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              {formatCurrency(receita.valor)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteReceita(receita.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>)}
                    </TableBody>
                  </Table>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB DE DESPESAS */}
        <TabsContent value="despesas" className="space-y-6 mt-6">
          {/* Despesas - Salários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users size={20} className="flex-shrink-0" />
            <span className="truncate">Salários dos Colaboradores</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {colaboradores.filter(c => c.status === "ativo" && c.salario && c.salario > 0).length === 0 ? <div className="text-center py-8 text-muted-foreground">
              Nenhum colaborador ativo com salário
            </div> : <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead className="text-right">Salário Mensal</TableHead>
                    {selectedMonth !== 'all' && <TableHead>Status Pagamento</TableHead>}
                    {selectedMonth !== 'all' && <TableHead className="w-[100px]">Ações</TableHead>}
                    {selectedMonth === 'all' && <TableHead className="text-right">Total Pago no Ano</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colaboradores.filter(c => c.status === "ativo" && c.salario && c.salario > 0).map(colaborador => {
                    const status = getSalaryPaymentStatus(colaborador.id);
                    const ano = parseInt(selectedYear);
                    const pagamentosAno = pagamentosSalarios.filter(p => p.colaborador_id === colaborador.id && p.ano === ano);
                    const totalPagoAno = pagamentosAno.reduce((sum, p) => sum + p.valor_pago, 0);
                    return <TableRow key={colaborador.id}>
                          <TableCell className="font-medium">{colaborador.nome}</TableCell>
                          <TableCell>{colaborador.funcao}</TableCell>
                          <TableCell>
                            {colaborador.departamento ? <Badge variant="secondary">{colaborador.departamento}</Badge> : <span className="text-muted-foreground text-sm">-</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              {formatCurrency(colaborador.salario || 0)}
                            </Badge>
                          </TableCell>
                          {selectedMonth !== 'all' && <>
                              <TableCell>
                                {status === 'pago' ? <Badge className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Pago
                                  </Badge> : <Badge variant="outline" className="text-orange-600 border-orange-600">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pendente
                                  </Badge>}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center">
                                  <Switch checked={status === 'pago'} onCheckedChange={() => handleToggleSalaryPayment(colaborador, status)} />
                                </div>
                              </TableCell>
                            </>}
                          {selectedMonth === 'all' && <TableCell className="text-right">
                              <Badge variant="outline" className="text-red-600 border-red-600">
                                {formatCurrency(totalPagoAno)}
                              </Badge>
                            </TableCell>}
                        </TableRow>;
                  })}
                </TableBody>
              </Table>
            </div>}
        </CardContent>
      </Card>

      {/* Outras Despesas */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-start sm:items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingDown size={20} className="flex-shrink-0" />
            Outras Despesas
          </CardTitle>
          <Button onClick={() => setIsAddDespesaOpen(true)} size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Lançar Despesa
          </Button>
        </CardHeader>
        <CardContent>
          {filteredDespesas.length === 0 ? <div className="text-center py-8 text-muted-foreground">
              Nenhuma despesa lançada no período selecionado
            </div> : <div className="overflow-x-auto">
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
                  {filteredDespesas.map(despesa => <TableRow key={despesa.id}>
                      <TableCell className="font-medium">{despesa.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{despesa.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(despesa.data), "dd/MM/yyyy", {
                        locale: ptBR
                      })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          {formatCurrency(despesa.valor)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteDespesa(despesa.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>}
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <Dialog open={isAddDespesaOpen} onOpenChange={setIsAddDespesaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lançar Nova Despesa</DialogTitle>
          </DialogHeader>
          <DespesaForm onSubmit={handleAddDespesa} onCancel={() => setIsAddDespesaOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddReceitaOpen} onOpenChange={setIsAddReceitaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lançar Nova Receita</DialogTitle>
          </DialogHeader>
          <ReceitaForm onSubmit={handleAddReceita} onCancel={() => setIsAddReceitaOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmPaymentDialog isOpen={isConfirmPaymentOpen} onClose={() => setIsConfirmPaymentOpen(false)} cliente={selectedCliente} onConfirm={handleConfirmPayment} />

      <ConfirmSalaryPaymentDialog isOpen={isConfirmSalaryPaymentOpen} onClose={() => setIsConfirmSalaryPaymentOpen(false)} colaborador={selectedColaborador} onConfirm={handleConfirmSalaryPayment} ano={parseInt(selectedYear)} mes={parseInt(selectedMonth)} />
    </div>;
};
export default Financeiro;