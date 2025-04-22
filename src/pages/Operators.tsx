
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Operators = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);

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

  const operators = [
    { id: 1, name: 'Carlos Silva', role: 'Operador Sênior', skills: ['Montagem', 'Teste'], status: 'active', workstation: 'Linha 01' },
    { id: 2, name: 'Maria Oliveira', role: 'Operador Pleno', skills: ['Montagem', 'Inspeção'], status: 'active', workstation: 'Linha 02' },
    { id: 3, name: 'João Santos', role: 'Operador Júnior', skills: ['Embalagem'], status: 'training', workstation: 'Linha 01' },
    { id: 4, name: 'Ana Costa', role: 'Operador Sênior', skills: ['Teste', 'Calibração'], status: 'vacation', workstation: 'Linha 03' },
    { id: 5, name: 'Pedro Almeida', role: 'Operador Pleno', skills: ['Montagem', 'Embalagem'], status: 'active', workstation: 'Linha 02' },
    { id: 6, name: 'Juliana Pereira', role: 'Operador Júnior', skills: ['Inspeção'], status: 'training', workstation: 'Linha 01' },
  ];

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold">Operadores</h1>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar operador..." className="pl-8" />
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Operador
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operators.map((operator) => (
              <Card key={operator.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">{operator.name}</CardTitle>
                    <Badge 
                      variant={
                        operator.status === 'active' ? 'default' : 
                        operator.status === 'training' ? 'secondary' : 
                        'outline'
                      }
                    >
                      {operator.status === 'active' ? 'Ativo' : 
                       operator.status === 'training' ? 'Em Treinamento' : 
                       'Em Férias'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/placeholder.svg`} />
                      <AvatarFallback>{operator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-muted-foreground">{operator.role}</p>
                      <p className="text-sm mt-1">Alocado: {operator.workstation}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {operator.skills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Operators;
