import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Plus, Search, Mail, Phone, Calendar, Trash2, Users, Building, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  funcao: string;
  departamento: string;
  status: "ativo" | "inativo";
  dataContratacao: string;
}

const Colaboradores = () => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([
    {
      id: "1",
      nome: "Maria Silva",
      email: "maria@poderalize.com",
      telefone: "(11) 99999-9999",
      funcao: "Designer Sênior",
      departamento: "Criativo",
      status: "ativo",
      dataContratacao: "2023-01-15"
    },
    {
      id: "2",
      nome: "João Santos",
      email: "joao@poderalize.com",
      telefone: "(11) 88888-8888",
      funcao: "Desenvolvedor Front-end",
      departamento: "Tecnologia",
      status: "ativo",
      dataContratacao: "2023-03-20"
    },
    {
      id: "3",
      nome: "Ana Costa",
      email: "ana@poderalize.com",
      telefone: "(11) 77777-7777",
      funcao: "Account Manager",
      departamento: "Atendimento",
      status: "ativo",
      dataContratacao: "2022-11-10"
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [colaboradorToDelete, setColaboradorToDelete] = useState<string | null>(null);
  const [novoColaborador, setNovoColaborador] = useState({
    nome: "",
    email: "",
    telefone: "",
    funcao: "",
    departamento: "",
  });

  const filteredColaboradores = colaboradores.filter(colaborador =>
    colaborador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colaborador.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colaborador.funcao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddColaborador = () => {
    if (!novoColaborador.nome || !novoColaborador.email || !novoColaborador.funcao) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const newColaborador: Colaborador = {
      id: Math.random().toString(36).substr(2, 9),
      ...novoColaborador,
      status: "ativo",
      dataContratacao: new Date().toISOString().split('T')[0]
    };

    setColaboradores([...colaboradores, newColaborador]);
    setNovoColaborador({
      nome: "",
      email: "",
      telefone: "",
      funcao: "",
      departamento: "",
    });
    setIsDialogOpen(false);
    toast.success("Colaborador adicionado com sucesso!");
  };

  const handleCardClick = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setIsDetailsOpen(true);
  };

  const handleDeleteColaborador = (id: string) => {
    setColaboradores(colaboradores.filter(c => c.id !== id));
    setColaboradorToDelete(null);
    toast.success("Colaborador removido com sucesso!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getBadgeColor = (departamento: string) => {
    const colors = {
      "Criativo": "bg-purple-500",
      "Tecnologia": "bg-blue-500",
      "Atendimento": "bg-green-500",
      "Marketing": "bg-orange-500",
      "Financeiro": "bg-red-500"
    };
    return colors[departamento as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <Layout title="Colaboradores">
      <div className="space-y-6 animate-fade-in">
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
                      <SelectItem value="Criativo">Criativo</SelectItem>
                      <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                      <SelectItem value="Atendimento">Atendimento</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
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
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="secondary" 
                        className={`${getBadgeColor(colaborador.departamento)} text-white`}
                      >
                        {colaborador.departamento}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setColaboradorToDelete(colaborador.id);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
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
                <span>{selectedColaborador?.nome}</span>
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
                    <p className="mt-1 text-sm">{selectedColaborador.funcao}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                      <Mail size={14} />
                      <span>E-mail</span>
                    </Label>
                    <p className="mt-1 text-sm">{selectedColaborador.email}</p>
                  </div>
                  
                  {selectedColaborador.telefone && (
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                        <Phone size={14} />
                        <span>Telefone</span>
                      </Label>
                      <p className="mt-1 text-sm">{selectedColaborador.telefone}</p>
                    </div>
                  )}
                  
                  {selectedColaborador.departamento && (
                    <div>
                      <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                        <Building size={14} />
                        <span>Departamento</span>
                      </Label>
                      <div className="mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`${getBadgeColor(selectedColaborador.departamento)} text-white`}
                        >
                          {selectedColaborador.departamento}
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center space-x-2">
                      <Calendar size={14} />
                      <span>Data de Contratação</span>
                    </Label>
                    <p className="mt-1 text-sm">{formatDate(selectedColaborador.dataContratacao)}</p>
                  </div>
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
    </Layout>
  );
};

export default Colaboradores;