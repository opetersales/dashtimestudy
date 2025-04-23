
import React, { useState } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { GboForm } from '@/components/gbo/GboForm';
import { GboCard } from '@/components/gbo/GboCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { GBO } from '@/utils/types';
import { WorkstationList } from '@/components/workstation/WorkstationList';
import { useToast } from '@/components/ui/use-toast';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();
  
  // Load GBOs from localStorage
  const [gbos, setGbos] = useState<GBO[]>(() => {
    return loadFromLocalStorage<GBO[]>('gboList', []);
  });

  const handleFormSubmit = (data: Partial<GBO>) => {
    const newGbo: GBO = {
      id: `gbo-${Date.now()}`,
      name: data.name || 'Novo GBO',
      productModel: data.productModel || 'N/A',
      productVariant: data.productVariant || 'Standard',
      productionLine: data.productionLine || 'N/A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
      version: '1.0',
      status: 'draft',
      cycleTime: data.cycleTime || 60,
      targetUPH: data.targetUPH || 80,
      actualUPH: data.actualUPH || 75,
      efficiency: data.efficiency || 0.7,
      operatorCount: data.operatorCount || 5,
      workstations: []
    };
    
    const updatedGbos = [...gbos, newGbo];
    setGbos(updatedGbos);
    saveToLocalStorage('gboList', updatedGbos);
    
    toast({
      title: "GBO criado com sucesso",
      description: `${newGbo.name} foi adicionado ao sistema.`,
    });
    setIsFormOpen(false);
  };

  const handleGboClick = (gbo: GBO) => {
    toast({
      title: gbo.name,
      description: `Eficiência: ${Math.round(gbo.efficiency * 100)}%, UPH Alvo: ${gbo.targetUPH}`,
    });
  };

  return (
    <BasePage title="Dashboard de Operações">
      <div className="flex justify-end mb-6">
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
          {gbos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gbos.map((gbo) => (
                <div 
                  key={gbo.id} 
                  onClick={() => handleGboClick(gbo)}
                  className="cursor-pointer"
                >
                  <GboCard gbo={gbo} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum GBO cadastrado. Clique no botão "Novo GBO" para começar.
            </div>
          )}
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
    </BasePage>
  );
};

export default Index;
