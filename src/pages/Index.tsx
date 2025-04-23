
import React, { useState } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { GboForm } from '@/components/gbo/GboForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { GBO } from '@/utils/types';
import { useToast } from '@/components/ui/use-toast';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  // Load GBOs from localStorage
  const [gbos, setGbos] = useState<GBO[]>(() => {
    return loadFromLocalStorage<GBO[]>('gboList', []);
  });

  // Função para obter o nome do usuário atual
  const getUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };

  // Função para registrar histórico
  const updateHistory = (action: string, details: string, gboName: string) => {
    const history = loadFromLocalStorage<any[]>('history', []);
    const newHistoryItem = {
      id: `hist-${Date.now()}`,
      name: gboName,
      version: '1.0',
      date: new Date().toISOString(),
      user: getUserName(),
      action: action,
      details,
    };
    history.unshift(newHistoryItem);
    saveToLocalStorage('history', history);
  };

  const handleFormSubmit = (data: Partial<GBO>) => {
    const newGbo: GBO = {
      id: `gbo-${Date.now()}`,
      name: data.name || 'Novo GBO',
      productModel: data.productModel || 'N/A',
      productVariant: data.productVariant || 'Standard',
      productionLine: data.productionLine || 'N/A',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: getUserName(),
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
    
    // Registrar no histórico
    updateHistory('create', `Criação do GBO ${newGbo.name}`, newGbo.name);
    
    setIsFormOpen(false);
  };

  return (
    <BasePage title="Dashboard de Operações">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo GBO
        </Button>
      </div>
      
      <Dashboard />
      
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
