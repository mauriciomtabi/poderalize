import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuthContext } from '@/contexts/AuthContext';
import { Eye, EyeOff, Sparkles, Shield, Users } from 'lucide-react';
import logo from "@/assets/poderalize-logo.png";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, loading, signIn, signUp } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-primary-light/20">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary-dark relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light rounded-full blur-lg opacity-30 scale-110"></div>
                <img 
                  src={logo} 
                  alt="Poderalize" 
                  className="w-20 h-20 rounded-full relative z-10 shadow-lg border-4 border-white"
                />
              </div>
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Poderalize
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Sistema de Gestão Inteligente
              </CardDescription>
            </div>

            {/* Features */}
            <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" />
                <span>CRM</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>IA</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-primary" />
                <span>Seguro</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(value) => setIsLogin(value === 'login')}>
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 border-2 focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-11 border-2 focus:border-primary pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Entrar no Sistema'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">Nome Completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-11 border-2 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerEmail" className="text-sm font-medium">E-mail</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 border-2 focus:border-primary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword" className="text-sm font-medium">Senha</Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11 border-2 focus:border-primary pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={isLoading}
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="text-center">
            <div className="w-full space-y-3">
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              <p className="text-sm text-muted-foreground">
                {isLogin ? (
                  <>
                    Novo no sistema? Clique em{" "}
                    <span className="text-primary font-medium cursor-pointer hover:underline"
                          onClick={() => setIsLogin(false)}>
                      "Cadastrar"
                    </span>
                  </>
                ) : (
                  <>
                    Após o cadastro, aguarde a{" "}
                    <span className="text-primary font-medium">aprovação do administrador</span>{" "}
                    para acessar o sistema
                  </>
                )}
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};