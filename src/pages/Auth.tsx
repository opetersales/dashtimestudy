
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { loginUser, registerUser, isAuthenticated } from '@/services/auth';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Schema de validação para o login
const loginSchema = z.object({
  email: z.string()
    .min(1, 'O e-mail é obrigatório')
    .email('Formato de e-mail inválido'),
});

// Schema de validação para o cadastro
const registerSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode exceder 100 caracteres'),
  email: z.string()
    .min(1, 'O e-mail é obrigatório')
    .email('Formato de e-mail inválido'),
  acceptTerms: z.boolean()
    .refine(val => val === true, {
      message: 'Você deve aceitar os termos para continuar',
    }),
});

const Auth = () => {
  // Gerenciamento de estado
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Formulários com React Hook Form
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      acceptTerms: false,
    },
  });

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  // Função de login
  const handleLogin = async (values) => {
    setIsLoading(true);
    try {
      const user = await loginUser(values.email);
      if (user) {
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo de volta, ${user.name}!`,
        });
        navigate('/');
      } else {
        toast({
          title: "E-mail não encontrado",
          description: "Verifique seu e-mail ou crie uma nova conta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função de cadastro
  const handleRegister = async (values) => {
    setIsLoading(true);
    try {
      const user = await registerUser(values.name, values.email);
      if (user) {
        toast({
          title: "Cadastro realizado com sucesso",
          description: `Seja bem-vindo, ${user.name}!`,
        });
        navigate('/');
      } else {
        toast({
          title: "E-mail já cadastrado",
          description: "Este e-mail já está em uso. Por favor, use outro ou faça login.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao tentar cadastrar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] p-4">
      {/* Logo do sistema (placeholder) */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">STime</h1>
        <p className="text-muted-foreground text-center">Sistema de Estudo de Tempos</p>
      </div>
      
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-2xl font-semibold text-[#1F2937]">
            {activeTab === 'login' ? 'Acessar Sistema' : 'Crie sua conta'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'login' 
              ? 'Digite seu e-mail para acessar o sistema' 
              : 'Preencha os campos abaixo para criar sua conta'}
          </CardDescription>
        </CardHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="text-sm">Entrar</TabsTrigger>
              <TabsTrigger value="register" className="text-sm">Cadastrar</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab de Login */}
          <TabsContent value="login" className="mt-0">
            <CardContent className="pt-4">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-[#1F2937]">E-mail</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="seu@email.com" 
                            type="email"
                            className="h-11 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-6 bg-[#2563EB] hover:bg-[#2563EB]/90 transition-all text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </span>
                    ) : "Entrar"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-4 text-center">
                <button
                  className="text-sm text-[#6B7280] hover:text-primary transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
            </CardContent>
          </TabsContent>
          
          {/* Tab de Registro */}
          <TabsContent value="register" className="mt-0">
            <CardContent className="pt-4">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-[#1F2937]">Nome completo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Seu nome completo" 
                            className="h-11 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-[#1F2937]">E-mail</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="seu@email.com" 
                            type="email"
                            className="h-11 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-[#EF4444]" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal text-[#6B7280]">
                            Li e aceito os termos de uso
                          </FormLabel>
                          <FormMessage className="text-xs text-[#EF4444]" />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-6 bg-[#2563EB] hover:bg-[#2563EB]/90 transition-all text-white font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </span>
                    ) : "Criar conta"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </TabsContent>
        </Tabs>
        
        <CardFooter className="flex justify-center py-4 border-t">
          <p className="text-xs text-[#6B7280]">
            © {new Date().getFullYear()} STime - Sistema de Estudo de Tempos
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
