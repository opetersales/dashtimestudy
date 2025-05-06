
import React, { useState } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { TimeStudy } from '@/utils/types';
import { useToast } from '@/components/ui/use-toast';
import { getUserData, saveUserData, loadFromLocalStorage } from '@/services/localStorage';
import { TimeStudyForm } from '@/components/timeStudy/TimeStudyForm';

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  // Load time studies from localStorage (user-specific)
  const [studies, setStudies] = useState<TimeStudy[]>(() => {
    return getUserData<TimeStudy[]>('timeStudies', []);
  });

  // Function to get current user name
  const getUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };

  // Function to record history
  const updateHistory = (action: string, details: string, studyName: string) => {
    const history = getUserData<any[]>('history', []);
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
    saveUserData('history', history);
  };

  const handleFormSubmit = (data: any) => {
    // Processar a data para garantir que seja string
    const studyDate = data.studyDate instanceof Date
      ? data.studyDate.toISOString()
      : new Date(data.studyDate).toISOString();

    const newStudy: TimeStudy = {
      id: `study-${Date.now()}`,
      client: data.client || '',
      modelName: data.modelName || '',
      studyDate: studyDate,
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
      status: 'draft', // Always start as draft
    };
    
    const updatedStudies = [...studies, newStudy];
    setStudies(updatedStudies);
    saveUserData('timeStudies', updatedStudies);
    
    toast({
      title: "Estudo criado",
      description: `${newStudy.client} - ${newStudy.modelName} foi criado como rascunho. Adicione linhas e postos de trabalho.`,
    });
    
    // Update history
    updateHistory(
      'create',
      `Criação do estudo de tempo ${newStudy.client} - ${newStudy.modelName}`,
      `${newStudy.client} - ${newStudy.modelName}`
    );
    
    setIsFormOpen(false);

    // Trigger dashboard update
    window.dispatchEvent(new Event('dashboardUpdate'));
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
            isEdit={false}
          />
        </DialogContent>
      </Dialog>
    </BasePage>
  );
};

export default Index;
