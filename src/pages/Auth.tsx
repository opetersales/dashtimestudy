
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { loginUser, registerUser, isAuthenticated } from '@/services/auth';

const Auth = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      toast({
        title: "Atenção",
        description: "Por favor, informe seu e-mail para continuar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = await loginUser(loginEmail);
      if (user) {
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo de volta, ${user.name}!`,
        });
        navigate('/');
      } else {
        toast({
          title: "Erro no login",
          description: "E-mail não encontrado. Por favor, verifique ou crie uma nova conta.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim() || !registerEmail.trim()) {
      toast({
        title: "Atenção",
        description: "Por favor, preencha todos os campos para se cadastrar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = await registerUser(registerName, registerEmail);
      if (user) {
        toast({
          title: "Cadastro realizado com sucesso",
          description: `Seja bem-vindo, ${user.name}!`,
        });
        navigate('/');
      } else {
        toast({
          title: "Erro no cadastro",
          description: "Este e-mail já está em uso. Por favor, use outro ou faça login.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">STime - Sistema de Estudos de Tempo</CardTitle>
          <CardDescription>Entre com sua conta ou crie uma nova</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="loginEmail" className="text-sm font-medium">E-mail</label>
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
              
              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">
                  Não tem uma conta?{" "}
                  <button 
                    className="text-primary hover:underline" 
                    onClick={() => setActiveTab('register')}
                    type="button"
                  >
                    Cadastre-se
                  </button>
                </span>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="registerName" className="text-sm font-medium">Nome</label>
                  <Input
                    id="registerName"
                    type="text"
                    placeholder="Seu nome"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="registerEmail" className="text-sm font-medium">E-mail</label>
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>
              
              <div className="mt-4 text-center text-sm">
                <span className="text-muted-foreground">
                  Já tem uma conta?{" "}
                  <button 
                    className="text-primary hover:underline" 
                    onClick={() => setActiveTab('login')}
                    type="button"
                  >
                    Entre aqui
                  </button>
                </span>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Sistema de Estudos de Tempo &copy; {new Date().getFullYear()}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
