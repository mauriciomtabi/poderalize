import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Search, Mail, Phone, Calendar, Trash2, Users, Building, UserCheck, Edit3, Save, X, Clock, UserX, Shield, Settings } from "lucide-react";
import { useColaboradores } from "@/hooks/useColaboradores";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import { UserPermissionsDialog } from "@/components/admin/UserPermissionsDialog";
import { Colaborador, DEPARTAMENTOS_DISPONIVEIS, STATUS_DISPONIVEIS } from "@/types/colaboradores";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Colaboradores = () => {
  const { colaboradores, loading, addColaborador, updateColaborador, deleteColaborador } = useColaboradores();
  const { pendingUsers, loading: loadingPendingUsers, approveUser, rejectUser, removeUser } = useUserRoles();
  const { allUsers, loading: loadingPermissions } = useUserPermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [colaboradorToDelete, setColaboradorToDelete] = useState<string | null>(null);
  const [userToRemove, setUserToRemove] = useState<any>(null);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<any>(null);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [novoColaborador, setNovoColaborador] = useState({
    nome: "",
    email: "",
    telefone: "",
    funcao: "",
    departamento: "",
    status: "ativo"
  });
  const [editingColaborador, setEditingColaborador] = useState({
    nome: "",
    email: "",
    telefone: "",
    funcao: "",
    departamento: "",
    status: ""
  });

  const filteredColaboradores = colaboradores.filter(colaborador =>
    colaborador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colaborador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colaborador.funcao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddColaborador = async () => {
    if (!novoColaborador.nome || !novoColaborador.email || !novoColaborador.funcao) {
      return;
    }

    try {
      await addColaborador({
        ...novoColaborador,
        data_contratacao: new Date().toISOString().split('T')[0]
      });
      
      setNovoColaborador({
        nome: "",
        email: "",
        telefone: "",
        funcao: "",
        departamento: "",
        status: "ativo"
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
      departamento: colaborador.departamento || "",
      status: colaborador.status
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
      const updated = await updateColaborador(selectedColaborador.id, editingColaborador);
      setSelectedColaborador(updated);
      setIsEditing(false);
    } catch (error) {
      // Error handling is done in the hook
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
        status: selectedColaborador.status
      });
    }
    setIsEditing(false);
  };

  const handleDeleteColaborador = async (id: string) => {
    try {
      await deleteColaborador(id);
      setColaboradorToDelete(null);
      setIsDetailsOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleRemoveUser = async (user: any) => {
    const success = await removeUser(user.user_id);
    if (success) {
      setUserToRemove(null);
    }
  };

  const handleApproveUser = async (userId: string, userEmail: string, userName: string) => {
    try {
      await approveUser(userId, userEmail, userName);
      // Note: Not automatically creating a colaborador entry anymore
      // The admin can manually add them later if needed
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleOpenPermissions = (user: any) => {
    setSelectedUserForPermissions(user);
    setIsPermissionsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase();
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
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs defaultValue="colaboradores" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colaboradores" className="flex items-center gap-2">
            <Users size={16} />
            Colaboradores Ativos
            <Badge variant="secondary" className="ml-2">
              {colaboradores.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Shield size={16} />
            Usuários Aprovados
            <Badge variant="secondary" className="ml-2">
              {allUsers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pendentes" className="flex items-center gap-2">
            <Clock size={16} />
            Usuários Pendentes
            {pendingUsers.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingUsers.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colaboradores" className="space-y-6">
          {/* Header com busca e botão de adicionar */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Buscar colaboradores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus size={16} className="mr-2" />
                  Novo Colaborador
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Colaborador</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={novoColaborador.nome}
                      onChange={(e) => setNovoColaborador({...novoColaborador, nome: e.target.value})}
                      placeholder="Ex: Maria Silva"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={novoColaborador.email}
                      onChange={(e) => setNovoColaborador({...novoColaborador, email: e.target.value})}
                      placeholder="Ex: maria@poderalize.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={novoColaborador.telefone}
                      onChange={(e) => setNovoColaborador({...novoColaborador, telefone: e.target.value})}
                      placeholder="Ex: (11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="funcao">Função *</Label>
                    <Input
                      id="funcao"
                      value={novoColaborador.funcao}
                      onChange={(e) => setNovoColaborador({...novoColaborador, funcao: e.target.value})}
                      placeholder="Ex: Designer Sênior"
                    />
                  </div>
                  <div>
                    <Label htmlFor="departamento">Departamento</Label>
                    <Select onValueChange={(value) => setNovoColaborador({...novoColaborador, departamento: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTAMENTOS_DISPONIVEIS.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

        {/* Grid de colaboradores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColaboradores.map((colaborador) => (
            <Card 
              key={colaborador.id} 
              className="card-interactive hover-lift cursor-pointer transition-all duration-200"
              onClick={() => handleCardClick(colaborador)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getInitials(colaborador.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{colaborador.nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{colaborador.funcao}</p>
                    </div>
                  </div>
                  <Badge variant={colaborador.status === "ativo" ? "default" : "secondary"}>
                    {colaborador.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{colaborador.email}</span>
                  </div>
                   {colaborador.telefone && (
                     <div className="flex items-center space-x-2 text-sm">
                       <Phone size={14} className="text-muted-foreground" />
                       <span className="text-muted-foreground">{colaborador.telefone}</span>
                     </div>
                   )}
                   {colaborador.departamento && (
                     <div>
                       <Badge 
                         variant="secondary" 
                         className={`${getBadgeColor(colaborador.departamento)} text-white`}
                       >
                         {colaborador.departamento}
                       </Badge>
                     </div>
                   )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

          {filteredColaboradores.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">
                Nenhum colaborador encontrado
              </h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Tente buscar com outros termos" : "Adicione o primeiro colaborador"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-6">
          {loadingPermissions ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {allUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Shield size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    Nenhum usuário aprovado
                  </h3>
                  <p className="text-muted-foreground">
                    Ainda não há usuários aprovados no sistema
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allUsers.map((user) => (
                    <Card key={user.id} className="card-interactive">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-blue-500 text-white font-semibold">
                                {user.profile?.full_name 
                                  ? getInitials(user.profile.full_name) 
                                  : '?'
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">
                                {user.profile?.full_name || 'Nome não informado'}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">Colaborador</p>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-500">
                            Ativo
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail size={14} className="text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {user.profile?.email || 'Email não informado'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Aprovado em: {format(new Date(user.assigned_at || user.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Permissões: {user.permissions?.filter((p: any) => p.granted).length || 0} de 9
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleOpenPermissions(user)}
                            >
                              <Settings size={14} className="mr-2" />
                              Permissões
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => setUserToRemove(user)}
                            >
                              <UserX size={14} className="mr-2" />
                              Remover
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="pendentes" className="space-y-6">
          {loadingPendingUsers ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Clock size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    Nenhum usuário pendente
                  </h3>
                  <p className="text-muted-foreground">
                    Todos os usuários foram aprovados ou não há novos cadastros
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingUsers.map((userRole) => (
                    <Card key={userRole.id} className="card-interactive">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-yellow-500 text-white font-semibold">
                                {(userRole as any).profiles?.full_name 
                                  ? getInitials((userRole as any).profiles.full_name) 
                                  : '?'
                                }
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
                            Cadastrado em: {format(new Date(userRole.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button 
                              size="sm" 
                              className="btn-primary flex-1"
                              onClick={() => handleApproveUser(
                                userRole.user_id, 
                                (userRole as any).profiles?.email || 'email@exemplo.com', 
                                (userRole as any).profiles?.full_name || 'Colaborador'
                              )}
                            >
                              <UserCheck size={14} className="mr-2" />
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="flex-1"
                              onClick={() => rejectUser(userRole.user_id)}
                            >
                              <UserX size={14} className="mr-2" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de Permissões */}
      <UserPermissionsDialog
        user={selectedUserForPermissions}
        open={isPermissionsDialogOpen}
        onOpenChange={setIsPermissionsDialogOpen}
      />

      {/* Dialog de Confirmação de Remoção de Usuário */}
      <AlertDialog open={!!userToRemove} onOpenChange={() => setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{userToRemove?.profile?.full_name}</strong> do sistema?
              <br/><br/>
              <span className="text-destructive font-medium">
                ⚠️ Esta ação é irreversível e removerá TODOS os dados do usuário, incluindo:
              </span>
              <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                <li>Perfil e informações pessoais</li>
                <li>Permissões de acesso</li>
                <li>Dados de colaboradores</li>
                <li>Atletas e avaliações</li>
                <li>Transações financeiras</li>
                <li>Metas e categorias</li>
                <li>Todos os outros dados relacionados</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => userToRemove && handleRemoveUser(userToRemove)}
            >
              Remover Completamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

        {/* Modal de Detalhes do Colaborador */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {selectedColaborador && getInitials(selectedColaborador.nome)}
                  </AvatarFallback>
                </Avatar>
                <span>{isEditing ? editingColaborador.nome : selectedColaborador?.nome}</span>
              </DialogTitle>
            </DialogHeader>
            {selectedColaborador && (
              <div className="space-y-6">
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
                    {isEditing ? (
                      <Input
                        value={editingColaborador.funcao}
                        onChange={(e) => setEditingColaborador({...editingColaborador, funcao: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{selectedColaborador.funcao}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                      <UserCheck size={14} />
                      <span>Nome</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editingColaborador.nome}
                        onChange={(e) => setEditingColaborador({...editingColaborador, nome: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{selectedColaborador.nome}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                      <Mail size={14} />
                      <span>E-mail</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editingColaborador.email}
                        onChange={(e) => setEditingColaborador({...editingColaborador, email: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{selectedColaborador.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                      <Phone size={14} />
                      <span>Telefone</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editingColaborador.telefone}
                        onChange={(e) => setEditingColaborador({...editingColaborador, telefone: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{selectedColaborador.telefone || "Não informado"}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                      <Building size={14} />
                      <span>Departamento</span>
                    </Label>
                    {isEditing ? (
                      <Select 
                        value={editingColaborador.departamento} 
                        onValueChange={(value) => setEditingColaborador({...editingColaborador, departamento: value})}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Criativo">Criativo</SelectItem>
                          <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                          <SelectItem value="Atendimento">Atendimento</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Financeiro">Financeiro</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        {selectedColaborador.departamento ? (
                          <Badge 
                            variant="secondary" 
                            className={`${getBadgeColor(selectedColaborador.departamento)} text-white`}
                          >
                            {selectedColaborador.departamento}
                          </Badge>
                        ) : (
                          <p className="text-sm text-muted-foreground">Não informado</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>Data de Contratação</span>
                    </Label>
                    <p className="mt-1 text-sm">{selectedColaborador.data_contratacao ? formatDate(selectedColaborador.data_contratacao) : "Não informado"}</p>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  {isEditing ? (
                    <div className="flex space-x-2 ml-auto">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        <X size={14} className="mr-2" />
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={handleSaveColaborador} className="btn-primary">
                        <Save size={14} className="mr-2" />
                        Salvar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2 ml-auto">
                      <Button variant="outline" size="sm" onClick={handleEditColaborador}>
                        <Edit3 size={14} className="mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setColaboradorToDelete(selectedColaborador.id)}
                      >
                        <Trash2 size={14} className="mr-2" />
                        Remover
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
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
              <AlertDialogAction
                onClick={() => colaboradorToDelete && handleDeleteColaborador(colaboradorToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
};

  export default Colaboradores;