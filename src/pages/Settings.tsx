
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const Settings = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  const { toast } = useToast();

  // Apply dark theme class to the html element
  React.useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram atualizadas com sucesso."
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header 
          sidebarCollapsed={sidebarCollapsed} 
          onToggleTheme={toggleTheme} 
          isDarkTheme={isDarkTheme} 
        />
        
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Configurações</h1>
          
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="account">Conta</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                  <CardDescription>
                    Gerencie suas preferências gerais do sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="theme-mode">Modo Escuro</Label>
                      <Switch 
                        id="theme-mode" 
                        checked={isDarkTheme}
                        onCheckedChange={toggleTheme}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Alternar entre tema claro e escuro.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sidebar-collapse">Recolher barra lateral automaticamente</Label>
                      <Switch id="sidebar-collapse" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recolher a barra lateral automaticamente em telas menores.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select defaultValue="pt-BR">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Selecione um idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Escolha o idioma de exibição do sistema.
                    </p>
                  </div>
                  
                  <Button onClick={handleSaveSettings}>Salvar Configurações</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Conta</CardTitle>
                  <CardDescription>
                    Gerencie suas informações de perfil e senha.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Seu nome" defaultValue="Usuário Demo" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Seu email" defaultValue="usuario@exemplo.com" />
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                  
                  <Button onClick={handleSaveSettings}>Atualizar Conta</Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
                  <CardDescription>
                    Configure opções avançadas do sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications">Notificações</Label>
                      <Switch id="notifications" defaultChecked />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações do sistema.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="uph-calculation">Método de Cálculo de UPH</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger id="uph-calculation">
                        <SelectValue placeholder="Selecione um método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Padrão</SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Escolha o método de cálculo para Unidades Por Hora.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-key">Chave de API para Integração</Label>
                    <div className="flex gap-2">
                      <Input id="api-key" defaultValue="sk_test_123456789" type="password" />
                      <Button variant="outline" className="shrink-0">Mostrar</Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Chave para integração com sistemas externos.
                    </p>
                  </div>
                  
                  <Button onClick={handleSaveSettings}>Salvar Configurações</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Settings;
