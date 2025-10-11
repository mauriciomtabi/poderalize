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
import { formatCNPJ, formatPhone, ensureUrlProtocol, getInstagramUrl, getFacebookUrl } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Cliente, CreateClienteData, UpdateClienteData } from '@/hooks/useClientes';
import { ClienteForm } from '@/components/clientes/ClienteForm';
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
  const totalValue = clientes.reduce((sum, cliente) => sum + (cliente.valor_fechamento || 0), 0);
  const averageValue = totalClientes > 0 ? totalValue / totalClientes : 0;
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
  return <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            
            
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClientes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averageValue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Buscar clientes por nome, empresa ou email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>
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
          </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClientes.map(cliente => <Card key={cliente.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick(cliente)}>
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
                    <Badge variant="secondary" className="flex-shrink-0">Cliente</Badge>
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

        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          if (!open) handleCloseAddModal();
        }}>
          <DialogContent id="cliente-add-content" className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Detalhes do Cliente
                </DialogTitle>
                <div className="flex gap-2">
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
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCliente.nome}</h3>
                    <p className="text-muted-foreground">{selectedCliente.empresa}</p>
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