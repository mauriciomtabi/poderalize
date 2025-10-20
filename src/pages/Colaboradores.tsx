import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Mail, Phone, Trash2, Users, Building, UserCheck, Edit3, Save, X, Clock, UserX, RefreshCw, Shield, Crown } from "lucide-react";
import { useColaboradores } from "@/hooks/useColaboradores";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useApprovedUsers } from "@/hooks/useApprovedUsers";
import { useToast } from "@/hooks/use-toast";
import { Colaborador, DEPARTAMENTOS_DISPONIVEIS, STATUS_DISPONIVEIS } from "@/types/colaboradores";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PermissionsDialog } from "@/components/colaboradores/PermissionsDialog";
import { PromoteToAdminDialog } from "@/components/colaboradores/PromoteToAdminDialog";
import { useAdminRole } from "@/hooks/useAdminRole";
import { getInitials } from "@/lib/utils";
import { AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
const Colaboradores = () => {
  const {
    colaboradores,
    loading,
    addColaborador,
    updateColaborador,
    deleteColaborador,
    syncApprovedUsers
  } = useColaboradores();
  const {
    pendingUsers,
    loading: loadingPendingUsers,
    approveUser,
    rejectUser
  } = useUserRoles();
  const {
    toast
  } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [colaboradorToDelete, setColaboradorToDelete] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [selectedUserIdForPermissions, setSelectedUserIdForPermissions] = useState<string>("");
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [selectedUserForPromotion, setSelectedUserForPromotion] = useState<{
    id: string;
    name: string;
    isAdmin: boolean;
  } | null>(null);
  const [adminUsers, setAdminUsers] = useState<Set<string>>(new Set());
  const {
    checkIsAdmin,
    promoteToAdmin,
    removeAdmin
  } = useAdminRole();
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [novoColaborador, setNovoColaborador] = useState({
    nome: "",
    email: "",
    telefone: "",
    funcao: "",
    departamento: "",
    status: "ativo",
    salario: ""
  });
  const [editingColaborador, setEditingColaborador] = useState({
    nome: "",
    email: "",
    telefone: "",
    funcao: "",
    departamento: "",
    status: "",
    salario: ""
  });
  const {
    profiles: approvedProfiles
  } = useApprovedUsers();
  const allActiveColaboradores: Colaborador[] = useMemo(() => {
    const existingByEmail = new Set(colaboradores.map(c => c.email));
    const nowIso = new Date().toISOString();
    const virtuals: Colaborador[] = (approvedProfiles || []).filter(p => p.email && !existingByEmail.has(p.email)).map(p => ({
      id: `virtual-${p.user_id}`,
      user_id: p.user_id,
      nome: (p.full_name || p.email || 'Colaborador') as string,
      email: (p.email || '') as string,
      funcao: 'A definir',
      telefone: null,
      departamento: null,
      status: 'ativo',
      avatar_url: null,
      created_at: nowIso,
      updated_at: nowIso
    }));
    return [...colaboradores, ...virtuals].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [colaboradores, approvedProfiles]);

  // Carregar status de admin para todos os colaboradores
  useEffect(() => {
    const loadAdminStatus = async () => {
      const adminSet = new Set<string>();
      for (const colab of allActiveColaboradores) {
        if (colab.user_id) {
          const isAdmin = await checkIsAdmin(colab.user_id);
          if (isAdmin) {
            adminSet.add(colab.user_id);
          }
        }
      }
      setAdminUsers(adminSet);
    };
    if (allActiveColaboradores.length > 0) {
      loadAdminStatus();
    }
  }, [allActiveColaboradores, checkIsAdmin]);

  // Verificar se o usuário atual é admin
  useEffect(() => {
    const checkCurrent = async () => {
      const {
        data
      } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (uid) {
        const isAdm = await checkIsAdmin(uid);
        setIsCurrentUserAdmin(!!isAdm);
      } else {
        setIsCurrentUserAdmin(false);
      }
    };
    checkCurrent();
  }, [checkIsAdmin]);
  const filteredColaboradores = allActiveColaboradores.filter(colaborador => colaborador.nome.toLowerCase().includes(searchTerm.toLowerCase()) || colaborador.email.toLowerCase().includes(searchTerm.toLowerCase()) || colaborador.funcao.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleAddColaborador = async () => {
    if (!novoColaborador.nome || !novoColaborador.email || !novoColaborador.funcao) {
      return;
    }
    try {
      await addColaborador({
        ...novoColaborador,
        salario: novoColaborador.salario ? parseFloat(novoColaborador.salario as any) : undefined
      });
      setNovoColaborador({
        nome: "",
        email: "",
        telefone: "",
        funcao: "",
        departamento: "",
        status: "ativo",
        salario: ""
      });
      setIsDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };
  const handleCardClick = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setEditingColaborador({
      nome: colaborador.nome,
      email: colaborador.email,
      telefone: colaborador.telefone || "",
      funcao: colaborador.funcao,
      // Normalizar departamento - se não estiver na lista válida, usar string vazia
      departamento: colaborador.departamento && DEPARTAMENTOS_DISPONIVEIS.includes(colaborador.departamento as any) ? colaborador.departamento : "",
      status: colaborador.status,
      salario: colaborador.salario?.toString() || ""
    });
    setIsEditing(false);
    setIsDetailsOpen(true);
  };
  const handleEditColaborador = () => {
    setIsEditing(true);
  };
  const handleSaveColaborador = async () => {
    if (!editingColaborador.nome || !editingColaborador.email || !editingColaborador.funcao || !selectedColaborador) {
      return;
    }
    try {
      // Se for um colaborador virtual (vindo de profiles), verifica se já existe no banco
      if (selectedColaborador.id.startsWith('virtual-')) {
        // Primeiro verifica se já existe um colaborador com esse email
        const existingColaborador = colaboradores.find(c => c.email === editingColaborador.email);
        if (existingColaborador) {
          // Se já existe, apenas atualiza
          const updated = await updateColaborador(existingColaborador.id, {
            ...editingColaborador,
            salario: editingColaborador.salario ? parseFloat(editingColaborador.salario as any) : undefined
          });
          setSelectedColaborador(updated);
          setIsEditing(false);
          return;
        }

        // Se não existe, cria novo
        const created = await addColaborador({
          nome: editingColaborador.nome,
          email: editingColaborador.email,
          telefone: editingColaborador.telefone || undefined,
          funcao: editingColaborador.funcao,
          departamento: editingColaborador.departamento || undefined,
          status: editingColaborador.status || 'ativo',
          salario: editingColaborador.salario ? parseFloat(editingColaborador.salario as any) : undefined
        });
        setSelectedColaborador(created);
        setIsEditing(false);
        return;
      }
      const updated = await updateColaborador(selectedColaborador.id, {
        ...editingColaborador,
        salario: editingColaborador.salario ? parseFloat(editingColaborador.salario as any) : undefined
      });
      setSelectedColaborador(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error);
    }
  };
  const handleCancelEdit = () => {
    if (selectedColaborador) {
      setEditingColaborador({
        nome: selectedColaborador.nome,
        email: selectedColaborador.email,
        telefone: selectedColaborador.telefone || "",
        funcao: selectedColaborador.funcao,
        departamento: selectedColaborador.departamento || "",
        status: selectedColaborador.status,
        salario: selectedColaborador.salario?.toString() || ""
      });
    }
    setIsEditing(false);
  };
  const handleDeleteColaborador = async (id: string) => {
    try {
      // Primeiro, determinar qual colaborador está sendo deletado
      const colaboradorToRemove = allActiveColaboradores.find(c => c.id === id);
      await deleteColaborador(id);

      // Atualizar o estado local imediatamente após a remoção bem-sucedida
      // Forçar re-sincronização dos dados
      await syncApprovedUsers();
      setColaboradorToDelete(null);
      setIsDetailsOpen(false);

      // Mostrar feedback específico
      toast({
        title: "Colaborador removido",
        description: `${colaboradorToRemove?.nome || 'Colaborador'} foi removido completamente do sistema`,
        variant: "destructive"
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };
  const handlePromoteToAdmin = async (userId: string, userName: string, isCurrentlyAdmin: boolean) => {
    setSelectedUserForPromotion({
      id: userId,
      name: userName,
      isAdmin: isCurrentlyAdmin
    });
    setIsPromoteDialogOpen(true);
  };
  const confirmPromoteToAdmin = async () => {
    if (!selectedUserForPromotion) return;
    let success = false;
    if (selectedUserForPromotion.isAdmin) {
      success = await removeAdmin(selectedUserForPromotion.id, selectedUserForPromotion.name);
      if (success) {
        setAdminUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedUserForPromotion.id);
          return newSet;
        });
      }
    } else {
      success = await promoteToAdmin(selectedUserForPromotion.id, selectedUserForPromotion.name);
      if (success) {
        setAdminUsers(prev => new Set(prev).add(selectedUserForPromotion.id));
      }
    }
    setIsPromoteDialogOpen(false);
    setSelectedUserForPromotion(null);
  };
  const handleApproveUser = async (userId: string, userEmail: string, userName: string) => {
    try {
      await approveUser(userId, userEmail, userName);

      // Automatically create colaborador entry for approved user with their user_id
      await addColaborador({
        nome: userName,
        email: userEmail,
        telefone: "",
        funcao: "A definir",
        departamento: "",
        status: "ativo"
      }, userId); // Pass the userId of the approved user

      toast({
        title: "Usuário aprovado e adicionado",
        description: "Usuário foi aprovado e adicionado à lista de colaboradores"
      });
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };
  const getBadgeColor = (departamento: string) => {
    const colors = {
      "RH": "bg-purple-500",
      "TI": "bg-blue-500",
      "Vendas": "bg-green-500",
      "Marketing": "bg-orange-500",
      "Financeiro": "bg-red-500",
      "Operações": "bg-yellow-500"
    };
    return colors[departamento as keyof typeof colors] || "bg-gray-500";
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>;
  }
  return <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-fade-in">
          Colaboradores
        </h2>
        <p className="text-muted-foreground">Gerencie sua equipe e usuários do sistema</p>
      </div>

      <Tabs defaultValue="colaboradores" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="colaboradores" className="flex items-center gap-2">
              <Users size={16} />
              Colaboradores Ativos
              <Badge variant="secondary" className="ml-2">
                {allActiveColaboradores.length}
              </Badge>
            </TabsTrigger>
          <TabsTrigger value="pendentes" className="flex items-center gap-2">
            <Clock size={16} />
            Usuários Pendentes
            {pendingUsers.length > 0 && <Badge variant="destructive" className="ml-2">
                {pendingUsers.length}
              </Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colaboradores" className="space-y-6">
          {/* Header com busca e botão de adicionar */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input placeholder="Buscar colaboradores..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            
            <div className="flex gap-2">
              
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  
                </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Colaborador</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input id="nome" value={novoColaborador.nome} onChange={e => setNovoColaborador({
                      ...novoColaborador,
                      nome: e.target.value
                    })} placeholder="Ex: Maria Silva" />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input id="email" type="email" value={novoColaborador.email} onChange={e => setNovoColaborador({
                      ...novoColaborador,
                      email: e.target.value
                    })} placeholder="Ex: maria@poderalize.com" />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" value={novoColaborador.telefone} onChange={e => setNovoColaborador({
                      ...novoColaborador,
                      telefone: e.target.value
                    })} placeholder="Ex: (11) 99999-9999" />
                  </div>
                  <div>
                    <Label htmlFor="funcao">Função *</Label>
                    <Input id="funcao" value={novoColaborador.funcao} onChange={e => setNovoColaborador({
                      ...novoColaborador,
                      funcao: e.target.value
                    })} placeholder="Ex: Designer Sênior" />
                  </div>
                  <div>
                    <Label htmlFor="departamento">Departamento</Label>
                    <Select onValueChange={value => setNovoColaborador({
                      ...novoColaborador,
                      departamento: value
                    })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTAMENTOS_DISPONIVEIS.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="salario">Salário Mensal (R$)</Label>
                    <Input 
                      id="salario" 
                      type="number" 
                      step="0.01" 
                      value={novoColaborador.salario} 
                      onChange={e => setNovoColaborador({
                        ...novoColaborador,
                        salario: e.target.value
                      })} 
                      placeholder="Ex: 5000.00" 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddColaborador} className="btn-primary">
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>

        {/* Grid de colaboradores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColaboradores.map(colaborador => {
            const isAdmin = colaborador.user_id && adminUsers.has(colaborador.user_id);
            return <Card key={colaborador.id} className={`card-interactive hover-lift cursor-pointer transition-all duration-200 ${isAdmin ? 'border-2 border-primary/50 shadow-lg' : ''}`} onClick={() => handleCardClick(colaborador)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          {colaborador.avatar_url && <AvatarImage src={colaborador.avatar_url} alt={colaborador.nome} />}
                          <AvatarFallback className={`font-semibold ${isAdmin ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground' : 'bg-primary text-primary-foreground'}`}>
                            {getInitials(colaborador.nome)}
                          </AvatarFallback>
                        </Avatar>
                        {isAdmin && <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                            <Crown className="h-3 w-3 text-primary-foreground" />
                          </div>}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{colaborador.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground">{colaborador.funcao}</p>
                      </div>
                    </div>
                    {isAdmin && <Badge variant="default" className="text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>}
                  </div>
                </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{colaborador.email}</span>
                  </div>
                   {colaborador.telefone && <div className="flex items-center space-x-2 text-sm">
                       <Phone size={14} className="text-muted-foreground" />
                       <span className="text-muted-foreground">{colaborador.telefone}</span>
                     </div>}
                   {colaborador.departamento && <div>
                       <Badge variant="secondary" className={`${getBadgeColor(colaborador.departamento)} text-white`}>
                         {colaborador.departamento}
                       </Badge>
                     </div>}
                   {colaborador.salario && colaborador.salario > 0 && <div>
                       <Badge variant="outline" className="text-green-600 border-green-600">
                         R$ {colaborador.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </Badge>
                     </div>}
                </div>
              </CardContent>
            </Card>;
          })}
        </div>

          {filteredColaboradores.length === 0 && <div className="text-center py-12">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">
                Nenhum colaborador encontrado
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente buscar com outros termos" : "Adicione o primeiro colaborador"}
              </p>
            </div>}
        </TabsContent>

        <TabsContent value="pendentes" className="space-y-6">
          {loadingPendingUsers ? <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div> : <>
              {pendingUsers.length === 0 ? <div className="text-center py-12">
                  <Clock size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    Nenhum usuário pendente
                  </h3>
                  <p className="text-muted-foreground">
                    Todos os usuários foram aprovados ou não há novos cadastros
                  </p>
                </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingUsers.map(userRole => <Card key={userRole.id} className="card-interactive">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-yellow-500 text-white font-semibold">
                                {(userRole as any).profiles?.full_name ? getInitials((userRole as any).profiles.full_name) : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">
                                {(userRole as any).profiles?.full_name || 'Nome não informado'}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">Aguardando aprovação</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Pendente
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail size={14} className="text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {(userRole as any).profiles?.email || 'Email não informado'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Cadastrado em: {format(new Date(userRole.created_at), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR
                    })}
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" className="btn-primary flex-1" onClick={() => handleApproveUser(userRole.user_id, (userRole as any).profiles?.email || 'email@exemplo.com', (userRole as any).profiles?.full_name || 'Colaborador')}>
                              <UserCheck size={14} className="mr-2" />
                              Aprovar
                            </Button>
                            <Button size="sm" variant="destructive" className="flex-1" onClick={() => rejectUser(userRole.user_id)}>
                              <UserX size={14} className="mr-2" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>}
            </>}
        </TabsContent>
      </Tabs>

        {/* Modal de Detalhes do Colaborador */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  {selectedColaborador?.avatar_url && <AvatarImage src={selectedColaborador.avatar_url} alt={selectedColaborador.nome} />}
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {selectedColaborador && getInitials(selectedColaborador.nome)}
                  </AvatarFallback>
                </Avatar>
                <span>{isEditing ? editingColaborador.nome : selectedColaborador?.nome}</span>
              </DialogTitle>
            </DialogHeader>
            {selectedColaborador && <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge variant={selectedColaborador.status === "ativo" ? "default" : "secondary"}>
                        {selectedColaborador.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">Função</Label>
                    {isEditing ? <Input value={editingColaborador.funcao} onChange={e => setEditingColaborador({
                ...editingColaborador,
                funcao: e.target.value
              })} className="mt-1" /> : <p className="mt-1 text-sm">{selectedColaborador.funcao}</p>}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                      <UserCheck size={14} />
                      <span>Nome</span>
                    </Label>
                    {isEditing ? <Input value={editingColaborador.nome} onChange={e => setEditingColaborador({
                ...editingColaborador,
                nome: e.target.value
              })} className="mt-1" /> : <p className="mt-1 text-sm">{selectedColaborador.nome}</p>}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                      <Mail size={14} />
                      <span>E-mail</span>
                    </Label>
                    {isEditing ? <Input type="email" value={editingColaborador.email} onChange={e => setEditingColaborador({
                ...editingColaborador,
                email: e.target.value
              })} className="mt-1" /> : <p className="mt-1 text-sm">{selectedColaborador.email}</p>}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                      <Phone size={14} />
                      <span>Telefone</span>
                    </Label>
                    {isEditing ? <Input value={editingColaborador.telefone} onChange={e => setEditingColaborador({
                ...editingColaborador,
                telefone: e.target.value
              })} className="mt-1" /> : <p className="mt-1 text-sm">{selectedColaborador.telefone || "Não informado"}</p>}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                      <Building size={14} />
                      <span>Departamento</span>
                    </Label>
                    {isEditing ? <Select value={editingColaborador.departamento} onValueChange={value => setEditingColaborador({
                ...editingColaborador,
                departamento: value
              })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTAMENTOS_DISPONIVEIS.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                        </SelectContent>
                      </Select> : <div className="mt-1">
                        {selectedColaborador.departamento ? <Badge variant="secondary" className={`${getBadgeColor(selectedColaborador.departamento)} text-white`}>
                            {selectedColaborador.departamento}
                          </Badge> : <p className="text-sm text-muted-foreground">Não informado</p>}
                      </div>}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">Salário Mensal</Label>
                    {isEditing ? <Input 
                      type="number" 
                      step="0.01" 
                      value={editingColaborador.salario} 
                      onChange={e => setEditingColaborador({
                        ...editingColaborador,
                        salario: e.target.value
                      })} 
                      className="mt-1" 
                      placeholder="0.00"
                    /> : <p className="mt-1 text-sm">
                      {selectedColaborador.salario && selectedColaborador.salario > 0 
                        ? `R$ ${selectedColaborador.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : "Não informado"}
                    </p>}
                  </div>
                  
                </div>

                <div className="flex justify-between pt-4 border-t">
                  {isEditing ? <div className="flex space-x-2 ml-auto">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <X size={14} className="mr-2" />
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSaveColaborador} className="btn-primary">
                        <Save size={14} className="mr-2" />
                        Salvar
                      </Button>
                    </div> : <div className="flex justify-between w-full">
                      <div className="flex space-x-2">
                        {isCurrentUserAdmin && <>
                            <Button variant="outline" size="icon" onClick={() => {
                    setSelectedUserIdForPermissions(selectedColaborador.user_id);
                    setIsPermissionsDialogOpen(true);
                  }} title="Gerenciar Permissões">
                              <Shield size={16} />
                            </Button>
                            {selectedColaborador.user_id && <Button variant={adminUsers.has(selectedColaborador.user_id) ? "secondary" : "default"} size="icon" onClick={() => handlePromoteToAdmin(selectedColaborador.user_id!, selectedColaborador.nome, adminUsers.has(selectedColaborador.user_id))} title={adminUsers.has(selectedColaborador.user_id) ? 'Remover Admin' : 'Promover a Admin'}>
                                <Crown size={16} />
                              </Button>}
                          </>}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={handleEditColaborador} title="Editar">
                          <Edit3 size={16} />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => setColaboradorToDelete(selectedColaborador.id)} title="Remover">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>}
                </div>
              </div>}
          </DialogContent>
        </Dialog>

        {/* Confirmação de Remoção */}
        <AlertDialog open={!!colaboradorToDelete} onOpenChange={() => setColaboradorToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza de que deseja remover este colaborador? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setColaboradorToDelete(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => colaboradorToDelete && handleDeleteColaborador(colaboradorToDelete)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Diálogo de Permissões */}
        {selectedColaborador && <PermissionsDialog isOpen={isPermissionsDialogOpen} onClose={() => setIsPermissionsDialogOpen(false)} userId={selectedUserIdForPermissions} userName={selectedColaborador.nome} />}

        {/* Dialog de Promoção a Admin */}
        {selectedUserForPromotion && <PromoteToAdminDialog isOpen={isPromoteDialogOpen} onClose={() => {
      setIsPromoteDialogOpen(false);
      setSelectedUserForPromotion(null);
    }} onConfirm={confirmPromoteToAdmin} userName={selectedUserForPromotion.name} isAdmin={selectedUserForPromotion.isAdmin} />}
    </div>;
};
export default Colaboradores;