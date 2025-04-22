
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

const History = () => {
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

  const historyItems = [
    { id: 1, name: 'GBO Linha 01', version: '1.2', date: '2025-04-19', user: 'Carlos Silva', action: 'update', details: 'Atualização de tempos de ciclo' },
    { id: 2, name: 'GBO Linha 02', version: '1.0', date: '2025-04-18', user: 'Maria Oliveira', action: 'create', details: 'Criação inicial do GBO' },
    { id: 3, name: 'GBO Linha 01', version: '1.1', date: '2025-04-17', user: 'João Santos', action: 'update', details: 'Adição de posto de trabalho' },
    { id: 4, name: 'GBO Linha 03', version: '1.3', date: '2025-04-16', user: 'Ana Costa', action: 'archive', details: 'Arquivamento da versão anterior' },
    { id: 5, name: 'GBO Linha 01', version: '1.0', date: '2025-04-15', user: 'Carlos Silva', action: 'create', details: 'Criação inicial do GBO' },
    { id: 6, name: 'GBO Linha 04', version: '1.1', date: '2025-04-14', user: 'Pedro Almeida', action: 'update', details: 'Redistribuição de atividades' },
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
          <h1 className="text-2xl font-bold mb-6">Histórico</h1>
          
          <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar no histórico..." className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
          </div>
          
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="mb-2">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="updates">Atualizações</TabsTrigger>
              <TabsTrigger value="creations">Criações</TabsTrigger>
              <TabsTrigger value="archives">Arquivamentos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico Completo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-2 py-3 text-left">GBO</th>
                          <th className="px-2 py-3 text-left">Versão</th>
                          <th className="px-2 py-3 text-left">Data</th>
                          <th className="px-2 py-3 text-left">Usuário</th>
                          <th className="px-2 py-3 text-left">Ação</th>
                          <th className="px-2 py-3 text-left">Detalhes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyItems.map(item => (
                          <tr key={item.id} className="border-b hover:bg-muted/50">
                            <td className="px-2 py-3">{item.name}</td>
                            <td className="px-2 py-3">{item.version}</td>
                            <td className="px-2 py-3">{new Date(item.date).toLocaleDateString()}</td>
                            <td className="px-2 py-3">{item.user}</td>
                            <td className="px-2 py-3">
                              <Badge 
                                variant={
                                  item.action === 'create' ? 'default' : 
                                  item.action === 'update' ? 'secondary' : 
                                  'outline'
                                }
                              >
                                {item.action === 'create' ? 'Criação' : 
                                 item.action === 'update' ? 'Atualização' : 
                                 'Arquivamento'}
                              </Badge>
                            </td>
                            <td className="px-2 py-3">{item.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="updates">
              <Card>
                <CardContent className="pt-6">
                  {historyItems
                    .filter(item => item.action === 'update')
                    .map(item => (
                      <div key={item.id} className="flex flex-col gap-1 border-b py-3 last:border-0">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name} v{item.version}</h3>
                          <Badge variant="secondary">Atualização</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()} por {item.user}
                        </p>
                        <p className="text-sm mt-1">{item.details}</p>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="creations">
              <Card>
                <CardContent className="pt-6">
                  {historyItems
                    .filter(item => item.action === 'create')
                    .map(item => (
                      <div key={item.id} className="flex flex-col gap-1 border-b py-3 last:border-0">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name} v{item.version}</h3>
                          <Badge>Criação</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()} por {item.user}
                        </p>
                        <p className="text-sm mt-1">{item.details}</p>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="archives">
              <Card>
                <CardContent className="pt-6">
                  {historyItems
                    .filter(item => item.action === 'archive')
                    .map(item => (
                      <div key={item.id} className="flex flex-col gap-1 border-b py-3 last:border-0">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name} v{item.version}</h3>
                          <Badge variant="outline">Arquivamento</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()} por {item.user}
                        </p>
                        <p className="text-sm mt-1">{item.details}</p>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default History;
