
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Planning = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());

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

  const events = [
    { id: 1, title: 'Revisão GBO Linha 01', date: new Date(), type: 'review', status: 'pending' },
    { id: 2, title: 'Implantação modelo XYZ', date: new Date(Date.now() + 86400000), type: 'implementation', status: 'scheduled' },
    { id: 3, title: 'Treinamento operadores', date: new Date(Date.now() + 172800000), type: 'training', status: 'scheduled' },
    { id: 4, title: 'Atualização padrões', date: new Date(Date.now() + 259200000), type: 'update', status: 'draft' },
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
          <h1 className="text-2xl font-bold mb-6">Planejamento</h1>
          
          <Tabs defaultValue="calendar" className="space-y-4">
            <TabsList>
              <TabsTrigger value="calendar">Calendário</TabsTrigger>
              <TabsTrigger value="upcoming">Próximos Eventos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Calendário de Atividades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Atividades do Dia</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {events
                      .filter(event => 
                        event.date.toDateString() === (date || new Date()).toDateString()
                      )
                      .map(event => (
                        <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {event.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              event.status === 'scheduled' ? 'default' : 
                              event.status === 'pending' ? 'secondary' : 
                              'outline'
                            }
                          >
                            {event.status === 'scheduled' ? 'Agendado' : 
                             event.status === 'pending' ? 'Pendente' : 
                             'Rascunho'}
                          </Badge>
                        </div>
                      ))}
                    {events.filter(event => 
                      event.date.toDateString() === (date || new Date()).toDateString()
                    ).length === 0 && (
                      <p className="text-center py-4 text-muted-foreground">
                        Nenhuma atividade para este dia
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Próximos Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.map(event => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.date.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            event.type === 'review' ? 'default' : 
                            event.type === 'implementation' ? 'secondary' : 
                            event.type === 'training' ? 'destructive' : 
                            'outline'
                          }
                        >
                          {event.type === 'review' ? 'Revisão' : 
                           event.type === 'implementation' ? 'Implantação' : 
                           event.type === 'training' ? 'Treinamento' : 
                           'Atualização'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Planning;
