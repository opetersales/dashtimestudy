
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { GboForm } from '@/components/gbo/GboForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { GBO } from '@/utils/types';
import { WorkstationList } from '@/components/workstation/WorkstationList';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');
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

  const handleFormSubmit = (data: Partial<GBO>) => {
    console.log('Form submitted:', data);
    toast({
      title: "GBO criado com sucesso",
      description: `${data.name} foi adicionado ao sistema.`,
    });
    setIsFormOpen(false);
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {activeTab === 'dashboard' ? 'Dashboard de Operações' :
               activeTab === 'gbos' ? 'Gerenciamento de GBOs' :
               activeTab === 'workstations' ? 'Postos de Trabalho' : 'GBO Dashboard'}
            </h1>
            
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo GBO
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="gbos">GBOs</TabsTrigger>
              <TabsTrigger value="workstations">Postos de Trabalho</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-4">
              <Dashboard />
            </TabsContent>
            
            <TabsContent value="gbos" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <GboCard 
                    key={i} 
                    gbo={{
                      id: `gbo-${i}`,
                      name: `GBO Linha ${i + 1}`,
                      productModel: ['ModelA', 'ModelB', 'ModelC'][i % 3],
                      productVariant: i % 2 === 0 ? 'Standard' : 'Premium',
                      productionLine: `Line0${i % 3 + 1}`,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      createdBy: 'Admin',
                      version: '1.0',
                      status: ['draft', 'active', 'archived'][i % 3] as any,
                      cycleTime: 60 + i * 10,
                      targetUPH: 80 + i * 5,
                      actualUPH: 75 + i * (i % 2 ? 7 : 3),
                      efficiency: 0.7 + (i % 3) * 0.1,
                      operatorCount: 5 + i % 3,
                      workstations: []
                    }}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="workstations" className="space-y-4">
              <WorkstationList 
                workstations={Array.from({ length: 5 }).map((_, i) => ({
                  id: `ws-${i}`,
                  name: `Posto de Trabalho ${i + 1}`,
                  position: i + 1,
                  cycleTime: 45 + i * 5,
                  activities: [
                    {
                      id: `act-${i}-1`,
                      name: `Atividade ${i + 1}.1`,
                      timeRequired: 20 + i * 2,
                    },
                    {
                      id: `act-${i}-2`,
                      name: `Atividade ${i + 1}.2`,
                      timeRequired: 15 + i,
                    }
                  ],
                  operatorId: i % 4 !== 3 ? `OP-10${i}` : undefined,
                  efficiency: 0.6 + (i % 5) * 0.1,
                  status: ['normal', 'optimal', 'warning', 'bottleneck', 'normal'][i] as any
                }))}
                onWorkstationClick={(ws) => {
                  toast({
                    title: `${ws.name}`,
                    description: `Status: ${ws.status}, Eficiência: ${Math.round(ws.efficiency * 100)}%`,
                  });
                }}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Criar Novo GBO</DialogTitle>
          </DialogHeader>
          <GboForm 
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
