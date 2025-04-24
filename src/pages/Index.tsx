
import React, { useState } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { TimeStudy } from '@/utils/types';
import { useToast } from '@/components/ui/use-toast';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { TimeStudyForm } from '@/components/timeStudy/TimeStudyForm';

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  // Load time studies from localStorage
  const [studies, setStudies] = useState<TimeStudy[]>(() => {
    return loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
  });

  // Function to get current user name
  const getUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };

  // Function to record history
  const updateHistory = (action: string, details: string, studyName: string) => {
    const history = loadFromLocalStorage<any[]>('history', []);
    const newHistoryItem = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString(),
      user: getUserName(),
      action: action,
      details: details,
      entityType: 'timeStudy',
      entityId: `study-${Date.now()}`,
      entityName: studyName,
    };
    history.unshift(newHistoryItem);
    saveToLocalStorage('history', history);
  };

  const handleFormSubmit = (data: Partial<TimeStudy>) => {
    const newStudy: TimeStudy = {
      id: `study-${Date.now()}`,
      client: data.client || '',
      modelName: data.modelName || '',
      studyDate: data.studyDate || new Date().toISOString(),
      responsiblePerson: data.responsiblePerson || '',
      monthlyDemand: data.monthlyDemand || 0,
      workingDays: data.workingDays || 22,
      dailyDemand: data.monthlyDemand && data.workingDays 
        ? Math.round(data.monthlyDemand / data.workingDays) 
        : 0,
      shifts: data.shifts || [],
      productionLines: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: getUserName(),
      version: '1.0',
      status: 'draft',
    };
    
    const updatedStudies = [...studies, newStudy];
    setStudies(updatedStudies);
    saveToLocalStorage('timeStudies', updatedStudies);
    
    toast({
      title: "Estudo criado com sucesso",
      description: `${newStudy.client} - ${newStudy.modelName} foi adicionado ao sistema.`,
    });
    
    // Update history
    updateHistory('create', `Criação do estudo de tempo ${newStudy.client} - ${newStudy.modelName}`, `${newStudy.client} - ${newStudy.modelName}`);
    
    setIsFormOpen(false);
  };

  return (
    <BasePage title="Dashboard de Estudos de Tempo">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Estudo
        </Button>
      </div>
      
      <Dashboard />
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Estudo</DialogTitle>
          </DialogHeader>
          <TimeStudyForm 
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </BasePage>
  );
};

export default Index;
