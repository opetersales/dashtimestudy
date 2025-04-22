
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@supabase/supabase-js';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Use os mesmos valores de fallback que no App.tsx
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Instancie o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Adicione logs para depuração
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase URL type:', typeof supabaseUrl);

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Verificar se conseguimos conectar ao Supabase
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        // Tente uma operação simples para verificar a conexão
        await supabase.auth.getSession();
        setSupabaseConnected(true);
      } catch (error) {
        console.error('Erro ao conectar ao Supabase:', error);
        setSupabaseConnected(false);
      }
    };

    checkSupabaseConnection();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Se estamos em modo de demonstração ou não conseguimos conectar ao Supabase
    if (demoMode || !supabaseConnected) {
      // Simule um atraso para parecer uma chamada de API real
      setTimeout(() => {
        toast({
          title: isLogin ? "Login de demonstração realizado!" : "Cadastro de demonstração realizado!",
          description: "Este é um modo de demonstração sem conexão com o backend.",
        });
        
        // Em modo de demonstração, sempre redirecione para o dashboard
        navigate('/');
        setLoading(false);
      }, 1000);
      
      return;
    }

    try {
      if (isLogin) {
        // Login with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
        
        // Redirect to dashboard
        navigate('/');
      } else {
        // Sign up with email and password
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu e-mail para confirmar o cadastro.",
        });
        
        // Switch to login mode after successful registration
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error('Erro na autenticação:', error);
      
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro durante a autenticação.",
        variant: "destructive",
      });
      
      // Se tivermos um erro de conexão, sugerimos o modo de demonstração
      if (error.message === 'Failed to fetch') {
        setSupabaseConnected(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const enableDemoMode = () => {
    setDemoMode(true);
    toast({
      title: "Modo de demonstração ativado",
      description: "Você pode fazer login sem conexão com o backend.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? 'Entrar no Sistema' : 'Criar Conta'}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Entre com seu e-mail e senha para acessar o dashboard.' 
              : 'Preencha os campos abaixo para criar uma nova conta.'}
          </CardDescription>
        </CardHeader>
        
        {!supabaseConnected && (
          <div className="px-6 pb-2">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro de conexão</AlertTitle>
              <AlertDescription>
                Não foi possível conectar ao servidor. Você pode usar o modo de demonstração para testar a aplicação.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="******" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {!supabaseConnected && !demoMode && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={enableDemoMode}
              >
                Usar modo de demonstração
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? 'Processando...' 
                : demoMode 
                  ? (isLogin ? 'Entrar (Demo)' : 'Cadastrar (Demo)') 
                  : (isLogin ? 'Entrar' : 'Cadastrar')
              }
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
