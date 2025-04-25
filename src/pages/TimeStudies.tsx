
import React, { useState, useEffect } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { TimeStudyForm } from '@/components/timeStudy/TimeStudyForm';
import { TimeStudy } from '@/utils/types';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';

const TimeStudies: React.FC = () => {
  const [studies, setStudies] = useState<TimeStudy[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<TimeStudy | null>(null);
  const [studyToDelete, setStudyToDelete] = useState<TimeStudy | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadedStudies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
    setStudies(loadedStudies);

    // Listen for dashboard updates to refresh the studies list
    const handleDashboardUpdate = () => {
      const refreshedStudies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
      setStudies(refreshedStudies);
    };

    window.addEventListener('dashboardUpdate', handleDashboardUpdate);
    
    return () => {
      window.removeEventListener('dashboardUpdate', handleDashboardUpdate);
    };
  }, []);

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

  // Helper functions that were missing in our update
  const handleDeleteStudy = (e: React.MouseEvent, study: TimeStudy) => {
    e.preventDefault();
    e.stopPropagation();
    setStudyToDelete(study);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteStudy = () => {
    if (!studyToDelete) return;
    
    const updatedStudies = studies.filter(s => s.id !== studyToDelete.id);
    setStudies(updatedStudies);
    saveToLocalStorage('timeStudies', updatedStudies);
    
    updateHistory(
      'delete',
      `Exclusão do estudo ${studyToDelete.client} - ${studyToDelete.modelName}`,
      `${studyToDelete.client} - ${studyToDelete.modelName}`
    );
    
    toast({
      title: "Estudo excluído",
      description: `${studyToDelete.client} - ${studyToDelete.modelName} foi excluído com sucesso.`,
    });
    
    setIsDeleteDialogOpen(false);
    setStudyToDelete(null);
    
    window.dispatchEvent(new Event('dashboardUpdate'));
  };

  const handleExportStudy = (e: React.MouseEvent, study: TimeStudy) => {
    e.preventDefault();
    e.stopPropagation();
    
    const blob = new Blob([JSON.stringify(study, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudo_${study.client}_${study.modelName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Estudo exportado",
      description: "Os dados do estudo foram exportados com sucesso."
    });
    
    updateHistory(
      'export',
      `Exportação do estudo ${study.client} - ${study.modelName}`,
      `${study.client} - ${study.modelName}`
    );
  };

  const handleFormSubmit = (data: any) => {
    // Process the date to ensure it's a string
    const studyDate = data.studyDate instanceof Date
      ? data.studyDate.toISOString()
      : new Date(data.studyDate).toISOString();
    
    if (selectedStudy) {
      // Update existing study
      const updatedStudy: TimeStudy = {
        ...selectedStudy,
        client: data.client || selectedStudy.client,
        modelName: data.modelName || selectedStudy.modelName,
        studyDate: studyDate,
        responsiblePerson: data.responsiblePerson || selectedStudy.responsiblePerson,
        monthlyDemand: data.monthlyDemand || selectedStudy.monthlyDemand,
        workingDays: data.workingDays || selectedStudy.workingDays,
        dailyDemand: data.monthlyDemand && data.workingDays 
          ? Math.round(data.monthlyDemand / data.workingDays) 
          : selectedStudy.dailyDemand,
        shifts: data.shifts || selectedStudy.shifts,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedStudies = studies.map(s => 
        s.id === updatedStudy.id ? updatedStudy : s
      );
      
      setStudies(updatedStudies);
      saveToLocalStorage('timeStudies', updatedStudies);
      
      toast({
        title: "Estudo atualizado",
        description: `${updatedStudy.client} - ${updatedStudy.modelName} foi atualizado com sucesso.`,
      });
      
      updateHistory(
        'update',
        `Atualização do estudo ${updatedStudy.client} - ${updatedStudy.modelName}`,
        `${updatedStudy.client} - ${updatedStudy.modelName}`
      );
    } else {
      // Create new study
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
      saveToLocalStorage('timeStudies', updatedStudies);
      
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
    }
    
    setIsFormOpen(false);
    setSelectedStudy(null);
    
    // Trigger dashboard update
    window.dispatchEvent(new Event('dashboardUpdate'));
  };

  return (
    <BasePage title="Estudos de Tempo">
      <div className="flex justify-end mb-6">
        <Button onClick={() => { setSelectedStudy(null); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Estudo
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studies.map(study => (
          <Card key={study.id} className="relative hover:shadow-lg transition-shadow">
            <Link to={`/study/${study.id}`} className="block">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{study.client}</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedStudy(study);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleDeleteStudy(e, study)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => handleExportStudy(e, study)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Modelo:</span> {study.modelName}
                  </div>
                  <div>
                    <span className="font-medium">Data:</span> {new Date(study.studyDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Responsável:</span> {study.responsiblePerson}
                  </div>
                  <div>
                    <span className="font-medium">Demanda Mensal:</span> {study.monthlyDemand.toLocaleString()} unidades
                  </div>
                  <div>
                    <span className="font-medium">Linhas de Produção:</span> {study.productionLines?.length || 0}
                  </div>
                  <div>
                    <span className="font-medium">Turnos:</span> {study.shifts?.length || 0}
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
        
        {studies.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <p className="text-lg mb-4">Nenhum estudo de tempo cadastrado ainda.</p>
            <Button onClick={() => { setSelectedStudy(null); setIsFormOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Estudo
            </Button>
          </div>
        )}
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedStudy ? 'Editar Estudo' : 'Criar Novo Estudo'}</DialogTitle>
          </DialogHeader>
          <TimeStudyForm 
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedStudy(null);
            }}
            isEdit={!!selectedStudy}
            initialData={selectedStudy ? {
              client: selectedStudy.client,
              modelName: selectedStudy.modelName,
              studyDate: new Date(selectedStudy.studyDate),
              responsiblePerson: selectedStudy.responsiblePerson,
              monthlyDemand: selectedStudy.monthlyDemand,
              workingDays: selectedStudy.workingDays,
              shifts: selectedStudy.shifts
            } : undefined}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir o estudo "{studyToDelete?.client} - {studyToDelete?.modelName}"?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteStudy}
            >
              Excluir Estudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BasePage>
  );
};

export default TimeStudies;
