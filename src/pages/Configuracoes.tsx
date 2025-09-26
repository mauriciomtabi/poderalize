import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Mail,
  Globe,
  Users,
  Zap
} from "lucide-react";

const Configuracoes = () => {
  return (
    <div className="space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-primary rounded-xl">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Configurações do Sistema</h2>
            <p className="text-muted-foreground">Gerencie as configurações da Poderalize</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Perfil da Empresa</span>
              </CardTitle>
              <CardDescription>
                Informações básicas da Poderalize
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gradient-primary text-white text-xl font-bold">
                    P
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input id="company-name" defaultValue="Poderalize" className="mt-1" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Principal</Label>
                  <Input id="email" type="email" defaultValue="contato@poderalize.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" defaultValue="+55 (11) 99999-9999" className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" defaultValue="Agência de Marketing Digital" className="mt-1" />
              </div>

              <Button className="bg-gradient-primary hover:opacity-90">
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          {/* Quick Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Configurações Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <Label htmlFor="notifications">Notificações</Label>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <Label htmlFor="email-alerts">Email Alerts</Label>
                </div>
                <Switch id="email-alerts" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <Label htmlFor="two-factor">2FA</Label>
                </div>
                <Switch id="two-factor" />
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Status do Sistema</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API</span>
                    <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Backup</span>
                    <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                      Agendado
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Aparência</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tema</Label>
                <div className="mt-2 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Claro
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Escuro
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Cor Principal</Label>
                <div className="mt-2 flex space-x-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full border-2 border-primary"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Equipe</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total de Membros:</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Administradores:</span>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex justify-between">
                  <span>Membros Ativos:</span>
                  <span className="font-medium">6</span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Gerenciar Equipe
              </Button>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Integrações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Google Workspace</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Slack</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">WhatsApp API</span>
                  <Switch />
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Ver Todas
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Configurações Avançadas</span>
            </CardTitle>
            <CardDescription>
              Configurações técnicas e de segurança
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Backup e Segurança</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-backup">Backup Automático</Label>
                    <Switch id="auto-backup" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="data-encryption">Criptografia de Dados</Label>
                    <Switch id="data-encryption" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Performance</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cache">Cache Ativado</Label>
                    <Switch id="cache" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compression">Compressão</Label>
                    <Switch id="compression" defaultChecked />
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex space-x-4">
              <Button variant="outline">
                Exportar Configurações
              </Button>
              <Button variant="outline">
                Importar Configurações
              </Button>
              <Button variant="destructive">
                Reset para Padrão
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  export default Configuracoes;