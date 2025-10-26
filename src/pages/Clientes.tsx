import React, { useState } from 'react';
import { useClientes } from '@/hooks/useClientes';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Search, DollarSign, Calendar, Building2, Phone, Mail, Globe, Plus, Pencil, User, Trash2, FileText } from 'lucide-react';
import { formatCNPJ, formatPhone, ensureUrlProtocol, getInstagramUrl, getFacebookUrl, cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Cliente, CreateClienteData, UpdateClienteData } from '@/hooks/useClientes';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { Switch } from '@/components/ui/switch';
import { InativarClienteDialog } from '@/components/clientes/InativarClienteDialog';
const Clientes = () => {
  const {
    clientes,
    isLoading,
    addCliente,
    updateCliente,
    deleteCliente
  } = useClientes();
  const {
    user
  } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [inativarDialogOpen, setInativarDialogOpen] = useState(false);
  const [clienteToInativar, setClienteToInativar] = useState<Cliente | null>(null);
  if (!user) {
    return <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Você precisa estar logado para acessar os clientes</p>
      </div>;
  }
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>;
  }

  // Filter clientes based on search term
  const filteredClientes = clientes.filter(cliente => cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) || cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase()) || cliente.email.toLowerCase().includes(searchTerm.toLowerCase()));

  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate metrics
  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter(c => c.status !== 'inativo').length;
  const clientesInativos = clientes.filter(c => c.status === 'inativo').length;
  const totalValue = clientes
    .filter(c => c.status !== 'inativo')
    .reduce((sum, cliente) => sum + (cliente.valor_fechamento || 0), 0);
  const averageValue = clientesAtivos > 0 ? totalValue / clientesAtivos : 0;

  // Calculate dinheiro and permuta totals so that Dinheiro + Permuta = Valor Total
  const { totalDinheiro, totalPermuta } = clientes
    .filter((c) => c.status !== 'inativo')
    .reduce(
      (acc, cliente) => {
        const base = Number(cliente.valor_fechamento || 0);

        let moneyDetail = 0;
        let permutaDetail = 0;

        // Serviços recorrentes
        if (cliente.servicos_recorrentes) {
          Object.values(cliente.servicos_recorrentes as Record<string, any>).forEach((servico: any) => {
            if (!servico) return;
            if (servico.ativo === false) return;
            const modo = servico.modo_pagamento as
              | 'dinheiro'
              | 'permuta'
              | 'dinheiro_permuta'
              | undefined;
            const valor = Number(servico.valor || 0);
            const vDin = Number(servico.valor_dinheiro || 0);
            const vPer = Number(servico.valor_permuta || 0);

            if (modo === 'dinheiro') moneyDetail += valor;
            else if (modo === 'permuta') permutaDetail += valor;
            else if (modo === 'dinheiro_permuta') {
              moneyDetail += vDin;
              permutaDetail += vPer;
            } else {
              // Sem identificação: considerar como dinheiro
              moneyDetail += valor;
            }
          });
        }

        // Serviços únicos
        if (cliente.servicos_unicos) {
          Object.values(cliente.servicos_unicos as Record<string, any>).forEach((servico: any) => {
            if (!servico?.selecionado) return;
            const modo = servico.modo_pagamento as
              | 'dinheiro'
              | 'permuta'
              | 'dinheiro_permuta'
              | undefined;
            const valor = Number(servico.valor || 0);
            const vDin = Number(servico.valor_dinheiro || 0);
            const vPer = Number(servico.valor_permuta || 0);

            if (modo === 'dinheiro') moneyDetail += valor;
            else if (modo === 'permuta') permutaDetail += valor;
            else if (modo === 'dinheiro_permuta') {
              moneyDetail += vDin;
              permutaDetail += vPer;
            } else {
              // Sem identificação: considerar como dinheiro
              moneyDetail += valor;
            }
          });
        }

        // Se houver detalhamento, normalizar para o valor de fechamento (quando existir)
        if (moneyDetail + permutaDetail > 0) {
          if (base > 0) {
            const sumDetail = moneyDetail + permutaDetail;
            const factor = sumDetail > 0 ? base / sumDetail : 0;
            moneyDetail = moneyDetail * factor;
            permutaDetail = permutaDetail * factor;
          }
          acc.totalDinheiro += moneyDetail;
          acc.totalPermuta += permutaDetail;
        } else {
          // Sem detalhamento: tudo conta como dinheiro
          acc.totalDinheiro += base;
        }

        return acc;
      },
      { totalDinheiro: 0, totalPermuta: 0 }
    );
  const handleCardClick = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsViewModalOpen(true);
  };

  const handleCloseAddModal = () => {
    // Don't remove draft when closing modal - only when explicitly canceling or submitting
    setIsAddModalOpen(false);
  };

  const handleAddCliente = async (clienteData: CreateClienteData) => {
    const result = await addCliente(clienteData);
    if (result) {
      localStorage.removeItem('cliente-form-draft');
      setIsAddModalOpen(false);
    }
  };

  const handleEditCliente = async (clienteData: CreateClienteData) => {
    if (!selectedCliente) return;
    
    const result = await updateCliente(selectedCliente.id, clienteData as UpdateClienteData);
    if (result) {
      setIsEditModalOpen(false);
      setIsViewModalOpen(false);
      setSelectedCliente(null);
    }
  };

  const handleOpenEdit = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteCliente = async () => {
    if (!selectedCliente) return;
    
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${selectedCliente.nome}?`)) {
      const result = await deleteCliente(selectedCliente.id);
      if (result) {
        setIsViewModalOpen(false);
        setSelectedCliente(null);
      }
    }
  };

  const handleToggleStatus = async (cliente: Cliente, novoStatus: boolean) => {
    // Se está ativando, apenas atualizar
    if (novoStatus) {
      await updateCliente(cliente.id, {
        status: 'ativo',
        motivo_inativo: undefined,
        data_inativacao: undefined,
      });
      return;
    }

    // Se está inativando, mostrar modal
    setClienteToInativar(cliente);
    setInativarDialogOpen(true);
  };

  const handleConfirmInativar = async (motivo: string) => {
    if (!clienteToInativar) return;

    const success = await updateCliente(clienteToInativar.id, {
      status: 'inativo',
      motivo_inativo: motivo,
      data_inativacao: new Date().toISOString(),
    });

    if (success) {
      // Fechar o modal de visualização se estiver aberto
      if (selectedCliente?.id === clienteToInativar.id) {
        setIsViewModalOpen(false);
        setSelectedCliente(null);
      }
    }

    setClienteToInativar(null);
  };
  return <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            
            
          </div>
        </div>

        {/* Metrics */}
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total de Clientes</p>
                <p className="text-2xl font-bold">{totalClientes}</p>
              </div>
              <div className="p-3 rounded-full bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Clientes Ativos</p>
                <p className="text-2xl font-bold text-green-600">{clientesAtivos}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-950">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Clientes Inativos</p>
                <p className="text-2xl font-bold text-red-600">{clientesInativos}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-950">
                <Users className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="p-3 rounded-full bg-muted">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Ticket Médio</p>
                <p className="text-2xl font-bold">{formatCurrency(averageValue)}</p>
              </div>
              <div className="p-3 rounded-full bg-muted">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Valor Dinheiro</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalDinheiro)}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-950">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Valor Permuta</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalPermuta)}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-950">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Buscar clientes..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Clientes List */}
        {filteredClientes.length === 0 ? <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}
              </h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {searchTerm ? 'Tente ajustar os termos de busca para encontrar clientes.' : 'Quando você fechar leads, eles aparecerão aqui como clientes.'}
              </p>
            </CardContent>
          </Card> : <div className="grid grid-cols-3 gap-6">
            {filteredClientes.map(cliente => <Card 
                key={cliente.id} 
                className={cn(
                  "cursor-pointer hover:shadow-lg transition-shadow p-6 landscape:p-3",
                  cliente.status === 'inativo' && "opacity-60 bg-muted/50 border-muted-foreground/20"
                )}
                onClick={() => handleCardClick(cliente)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={cliente.avatar_url} alt={cliente.nome} />
                      <AvatarFallback>
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{cliente.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{cliente.empresa}</p>
                    </div>
                    <Badge 
                      variant={cliente.status === 'inativo' ? 'destructive' : 'secondary'}
                      className="flex-shrink-0"
                    >
                      {cliente.status === 'inativo' ? 'Inativo' : 'Cliente'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                  
                  {cliente.cnpj && <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{formatCNPJ(cliente.cnpj)}</span>
                    </div>}
                  
                  {cliente.telefone && <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{formatPhone(cliente.telefone)}</span>
                    </div>}

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-green-600">
                      {formatCurrency(cliente.valor_fechamento)}
                    </span>
                  </div>

                  {cliente.pagamento_mensal ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        Mensal - Dia {cliente.dia_pagamento}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(parseISO(cliente.data_fechamento), 'dd/MM/yyyy', {
                  locale: ptBR
                })}
                      </span>
                    </div>
                  )}

                  {cliente.fonte_original && <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{cliente.fonte_original}</span>
                    </div>}
                </CardContent>
              </Card>)}
          </div>}

        {/* Inativar Dialog */}
        {clienteToInativar && (
          <InativarClienteDialog
            open={inativarDialogOpen}
            onOpenChange={setInativarDialogOpen}
            onConfirm={handleConfirmInativar}
            clienteNome={clienteToInativar.nome}
          />
        )}

        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          if (!open) handleCloseAddModal();
        }}>
          <DialogContent id="cliente-add-content" className="max-w-full sm:max-w-4xl max-h-[95vh] landscape:max-h-[90vh] sm:max-h-[90vh] p-6 landscape:p-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 landscape:gap-1 text-lg landscape:text-base">
                <Plus className="h-5 w-5 landscape:h-4 landscape:w-4" />
                Adicionar Novo Cliente
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              <ClienteForm 
                key={isAddModalOpen ? Date.now() : 'closed'}
                onSubmit={handleAddCliente}
                onCancel={handleCloseAddModal}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-full sm:max-w-4xl max-h-[95vh] landscape:max-h-[90vh] sm:max-h-[90vh] overflow-y-auto p-6 landscape:p-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 landscape:gap-1 text-lg landscape:text-base">
                <Pencil className="h-5 w-5 landscape:h-4 landscape:w-4" />
                Editar Cliente
              </DialogTitle>
            </DialogHeader>
            <ClienteForm 
              onSubmit={handleEditCliente}
              onCancel={() => setIsEditModalOpen(false)}
              initialData={selectedCliente || undefined}
            />
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Detalhes do Cliente
                </DialogTitle>
                <div className="flex gap-2 pr-10">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenEdit}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteCliente}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {selectedCliente && <div className="space-y-6">
                {/* Avatar and Basic Info Header */}
                <div className="flex items-center gap-4 pb-4 border-b">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedCliente.avatar_url} alt={selectedCliente.nome} />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedCliente.nome}</h3>
                    <p className="text-muted-foreground">{selectedCliente.empresa}</p>
                    <div className="mt-2">
                      <Badge variant={selectedCliente.status === 'inativo' ? 'destructive' : 'default'}>
                        {selectedCliente.status === 'inativo' ? 'Cliente Inativo' : 'Cliente Ativo'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-l pl-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">Status do Cliente</p>
                      <p className="text-sm font-medium">
                        {selectedCliente.status === 'inativo' ? 'Inativo' : 'Ativo'}
                      </p>
                    </div>
                    <Switch
                      checked={selectedCliente.status !== 'inativo'}
                      onCheckedChange={(checked) => handleToggleStatus(selectedCliente, checked)}
                    />
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedCliente.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Empresa</label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedCliente.empresa}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedCliente.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">CNPJ</label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedCliente.cnpj ? formatCNPJ(selectedCliente.cnpj) : 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefone</label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedCliente.telefone ? formatPhone(selectedCliente.telefone) : 'Não informado'}</p>
                  </div>
                </div>

                {/* Status de Inativação */}
                {selectedCliente.status === 'inativo' && selectedCliente.motivo_inativo && (
                  <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
                    <h3 className="text-sm font-semibold text-destructive mb-3">INFORMAÇÕES DE INATIVAÇÃO</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm font-medium">Motivo</label>
                        <p className="text-sm text-muted-foreground mt-1">{selectedCliente.motivo_inativo}</p>
                      </div>
                      {selectedCliente.data_inativacao && (
                        <div>
                          <label className="text-sm font-medium">Data de Inativação</label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(parseISO(selectedCliente.data_inativacao), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Financial Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Valor do Fechamento</label>
                    <p className="text-lg font-semibold text-green-600 mt-1">
                      {formatCurrency(selectedCliente.valor_fechamento)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Data do Fechamento</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(parseISO(selectedCliente.data_fechamento), 'dd/MM/yyyy', {
                  locale: ptBR
                })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Fonte Original</label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedCliente.fonte_original || 'Não informado'}</p>
                  </div>
                </div>

                {/* Digital Presence */}
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-3">PRESENÇA DIGITAL</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Site</label>
                      <p className="text-sm mt-1">
                        {selectedCliente.site ? (
                          <a 
                            href={ensureUrlProtocol(selectedCliente.site)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Globe className="h-4 w-4" />
                            {selectedCliente.site}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Não informado</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Instagram</label>
                      <p className="text-sm mt-1">
                        {selectedCliente.instagram ? (
                          <a 
                            href={getInstagramUrl(selectedCliente.instagram)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline"
                          >
                            {selectedCliente.instagram}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Não informado</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Facebook</label>
                      <p className="text-sm mt-1">
                        {selectedCliente.facebook ? (
                          <a 
                            href={getFacebookUrl(selectedCliente.facebook)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline"
                          >
                            {selectedCliente.facebook}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Não informado</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Outras Redes Sociais (LinkedIn, TikTok, etc)</label>
                      <p className="text-sm mt-1">
                        {selectedCliente.outras_redes_sociais ? (
                          <a 
                            href={ensureUrlProtocol(selectedCliente.outras_redes_sociais)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline whitespace-pre-wrap"
                          >
                            {selectedCliente.outras_redes_sociais}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Não informado</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Behavior and Potential */}
                {(selectedCliente.nivel_consciencia || selectedCliente.etapa_jornada || 
                  selectedCliente.indicador_potencial || selectedCliente.equipe_atual) && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Comportamento e Potencial</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCliente.nivel_consciencia && (
                        <div>
                          <label className="text-sm font-medium">Nível de Consciência</label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedCliente.nivel_consciencia}</p>
                        </div>
                      )}
                      {selectedCliente.etapa_jornada && (
                        <div>
                          <label className="text-sm font-medium">Etapa da Jornada</label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedCliente.etapa_jornada}</p>
                        </div>
                      )}
                      {selectedCliente.indicador_potencial && (
                        <div>
                          <label className="text-sm font-medium">Indicador de Potencial</label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedCliente.indicador_potencial}</p>
                        </div>
                      )}
                      {selectedCliente.equipe_atual && (
                        <div>
                          <label className="text-sm font-medium">Equipe Atual</label>
                          <p className="text-sm text-muted-foreground mt-1">{selectedCliente.equipe_atual}</p>
                        </div>
                      )}
                    </div>
                    {selectedCliente.observacoes_comportamento && (
                      <div>
                        <label className="text-sm font-medium">Observações de Comportamento</label>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {selectedCliente.observacoes_comportamento}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Serviços Recorrentes */}
                {selectedCliente.servicos_recorrentes && Object.values(selectedCliente.servicos_recorrentes).some((s: any) => s?.ativo) && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary">SERVIÇOS RECORRENTES ATIVOS</h3>
                    <div className="space-y-3">
                      {selectedCliente.servicos_recorrentes.social_media?.ativo && (
                        <Card className="p-4">
                          <h4 className="font-semibold mb-2">Social Mídia</h4>
                          {selectedCliente.servicos_recorrentes.social_media.plano && (
                            <p className="text-sm text-muted-foreground mb-2">{selectedCliente.servicos_recorrentes.social_media.plano}</p>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="font-medium">Valor:</span> {formatCurrency(selectedCliente.servicos_recorrentes.social_media.valor)}</div>
                            {selectedCliente.servicos_recorrentes.social_media.qtde_feed && (
                              <div><span className="font-medium">Feed:</span> {selectedCliente.servicos_recorrentes.social_media.qtde_feed}</div>
                            )}
                            {selectedCliente.servicos_recorrentes.social_media.qtde_reels && (
                              <div><span className="font-medium">Reels:</span> {selectedCliente.servicos_recorrentes.social_media.qtde_reels}</div>
                            )}
                            {selectedCliente.servicos_recorrentes.social_media.qtde_stories_semanais && (
                              <div><span className="font-medium">Stories:</span> {selectedCliente.servicos_recorrentes.social_media.qtde_stories_semanais}/semana</div>
                            )}
                          </div>
                        </Card>
                      )}
                      
                      {selectedCliente.servicos_recorrentes.trafego_pago?.ativo && (
                        <Card className="p-4">
                          <h4 className="font-semibold mb-2">Tráfego Pago</h4>
                          {selectedCliente.servicos_recorrentes.trafego_pago.plano && (
                            <p className="text-sm text-muted-foreground mb-2">{selectedCliente.servicos_recorrentes.trafego_pago.plano}</p>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="font-medium">Valor:</span> {formatCurrency(selectedCliente.servicos_recorrentes.trafego_pago.valor)}</div>
                            {selectedCliente.servicos_recorrentes.trafego_pago.qtde_campanhas && (
                              <div><span className="font-medium">Campanhas:</span> {selectedCliente.servicos_recorrentes.trafego_pago.qtde_campanhas}</div>
                            )}
                          </div>
                        </Card>
                      )}
                      
                      {selectedCliente.servicos_recorrentes.treinamento_vendas?.ativo && (
                        <Card className="p-4">
                          <h4 className="font-semibold mb-2">Treinamento de Vendas</h4>
                          {selectedCliente.servicos_recorrentes.treinamento_vendas.plano && (
                            <p className="text-sm text-muted-foreground mb-2">{selectedCliente.servicos_recorrentes.treinamento_vendas.plano}</p>
                          )}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div><span className="font-medium">Valor:</span> {formatCurrency(selectedCliente.servicos_recorrentes.treinamento_vendas.valor)}</div>
                            {selectedCliente.servicos_recorrentes.treinamento_vendas.periodo && (
                              <div><span className="font-medium">Período:</span> {selectedCliente.servicos_recorrentes.treinamento_vendas.periodo}</div>
                            )}
                          </div>
                        </Card>
                      )}
                      
                      {selectedCliente.servicos_recorrentes.google_ads?.ativo && (
                        <Card className="p-4">
                          <h4 className="font-semibold mb-2">Google Ads</h4>
                          {selectedCliente.servicos_recorrentes.google_ads.plano && (
                            <p className="text-sm text-muted-foreground mb-2">{selectedCliente.servicos_recorrentes.google_ads.plano}</p>
                          )}
                          <div className="text-sm">
                            <span className="font-medium">Valor:</span> {formatCurrency(selectedCliente.servicos_recorrentes.google_ads.valor)}
                          </div>
                        </Card>
                      )}
                      
                      {selectedCliente.servicos_recorrentes.assinatura_jornada?.ativo && (
                        <Card className="p-4">
                          <h4 className="font-semibold mb-2">Assinatura Jornada Poderalize</h4>
                          <div className="text-sm">
                            <span className="font-medium">Valor:</span> {formatCurrency(selectedCliente.servicos_recorrentes.assinatura_jornada.valor)}
                          </div>
                        </Card>
                      )}
                      
                      <div className="pt-2 border-t">
                        <p className="text-sm font-semibold">
                          Total Mensal Recorrente: {formatCurrency(
                            (selectedCliente.servicos_recorrentes.social_media?.ativo ? (selectedCliente.servicos_recorrentes.social_media.valor || 0) : 0) +
                            (selectedCliente.servicos_recorrentes.trafego_pago?.ativo ? (selectedCliente.servicos_recorrentes.trafego_pago.valor || 0) : 0) +
                            (selectedCliente.servicos_recorrentes.treinamento_vendas?.ativo ? (selectedCliente.servicos_recorrentes.treinamento_vendas.valor || 0) : 0) +
                            (selectedCliente.servicos_recorrentes.google_ads?.ativo ? (selectedCliente.servicos_recorrentes.google_ads.valor || 0) : 0) +
                            (selectedCliente.servicos_recorrentes.assinatura_jornada?.ativo ? (selectedCliente.servicos_recorrentes.assinatura_jornada.valor || 0) : 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Serviços Únicos */}
                {selectedCliente.servicos_unicos && Object.values(selectedCliente.servicos_unicos).some((s: any) => s?.selecionado) && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-primary">HISTÓRICO DE SERVIÇOS ÚNICOS</h3>
                    <div className="space-y-3">
                      {selectedCliente.servicos_unicos.criacao_site?.selecionado && (
                        <Card className="p-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Criação de Site</h4>
                            <Badge variant="secondary">{formatCurrency(selectedCliente.servicos_unicos.criacao_site.valor)}</Badge>
                          </div>
                        </Card>
                      )}
                      
                      {selectedCliente.servicos_unicos.identidade_visual?.selecionado && (
                        <Card className="p-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Identidade Visual</h4>
                            <Badge variant="secondary">{formatCurrency(selectedCliente.servicos_unicos.identidade_visual.valor)}</Badge>
                          </div>
                        </Card>
                      )}
                      
                      {selectedCliente.servicos_unicos.plataforma_vendas?.selecionado && (
                        <Card className="p-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Plataforma de Vendas On-line</h4>
                            <Badge variant="secondary">{formatCurrency(selectedCliente.servicos_unicos.plataforma_vendas.valor)}</Badge>
                          </div>
                        </Card>
                      )}
                      
                      {selectedCliente.servicos_unicos.outros?.selecionado && (
                        <Card className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">Outros</h4>
                              {selectedCliente.servicos_unicos.outros.descricao && (
                                <p className="text-sm text-muted-foreground mt-1">{selectedCliente.servicos_unicos.outros.descricao}</p>
                              )}
                            </div>
                            <Badge variant="secondary">{formatCurrency(selectedCliente.servicos_unicos.outros.valor)}</Badge>
                          </div>
                        </Card>
                      )}
                      
                      <div className="pt-2 border-t">
                        <p className="text-sm font-semibold">
                          Total de Investimento Único: {formatCurrency(
                            (selectedCliente.servicos_unicos.criacao_site?.selecionado ? (selectedCliente.servicos_unicos.criacao_site.valor || 0) : 0) +
                            (selectedCliente.servicos_unicos.identidade_visual?.selecionado ? (selectedCliente.servicos_unicos.identidade_visual.valor || 0) : 0) +
                            (selectedCliente.servicos_unicos.plataforma_vendas?.selecionado ? (selectedCliente.servicos_unicos.plataforma_vendas.valor || 0) : 0) +
                            (selectedCliente.servicos_unicos.outros?.selecionado ? (selectedCliente.servicos_unicos.outros.valor || 0) : 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observations */}
                {selectedCliente.observacoes && <div>
                    <label className="text-sm font-medium">Observações</label>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {selectedCliente.observacoes}
                    </p>
                  </div>}

                {/* Salesperson */}
                {selectedCliente.vendedor_nome && <div>
                    <label className="text-sm font-medium">Vendedor Responsável</label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedCliente.vendedor_nome}</p>
                  </div>}
              </div>}
          </DialogContent>
        </Dialog>
      </div>;
};
export default Clientes;