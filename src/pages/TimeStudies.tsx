
import React, { useState, useEffect } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Plus, Trash, File } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { TimeStudyForm } from '@/components/timeStudy/TimeStudyForm';
import { TimeStudy, Shift } from '@/utils/types';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TimeStudies = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<TimeStudy | null>(null);
  const { toast } = useToast();

  const [studies, setStudies] = useState<TimeStudy[]>(() => {
    return loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
  });

  // Effect to listen for dashboard updates
  useEffect(() => {
    const handleDashboardUpdate = () => {
      // Reload studies from localStorage
      const updatedStudies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
      setStudies(updatedStudies);
    };

    window.addEventListener('dashboardUpdate', handleDashboardUpdate);
    return () => {
      window.removeEventListener('dashboardUpdate', handleDashboardUpdate);
    };
  }, []);

  const getUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };

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

  const handleFormSubmit = (data: Partial<TimeStudy>, isDraft: boolean) => {
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
      status: isDraft ? 'draft' : 'active',
    };
    
    const updatedStudies = [...studies, newStudy];
    setStudies(updatedStudies);
    saveToLocalStorage('timeStudies', updatedStudies);
    
    toast({
      title: isDraft ? "Rascunho salvo" : "Estudo publicado",
      description: `${newStudy.client} - ${newStudy.modelName} foi ${isDraft ? 'salvo como rascunho' : 'publicado'}.`,
    });
    
    updateHistory(
      isDraft ? 'draft' : 'create', 
      `${isDraft ? 'Rascunho criado' : 'Publicação'} do estudo ${newStudy.client} - ${newStudy.modelName}`, 
      `${newStudy.client} - ${newStudy.modelName}`
    );
    
    setIsFormOpen(false);

    // Trigger dashboard update
    window.dispatchEvent(new Event('dashboardUpdate'));
  };

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
    
    // Trigger dashboard update
    window.dispatchEvent(new Event('dashboardUpdate'));
  };

  const handleExportStudy = (e: React.MouseEvent, study: TimeStudy) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a blob with just this study data
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

  return (
    <BasePage title="Estudos de Tempo" subtitle="Gerencie seus estudos de tempo e análises de linhas de produção">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Estudo
        </Button>
      </div>

      {studies.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Nenhum estudo de tempo encontrado</CardTitle>
            <CardDescription>
              Comece criando seu primeiro estudo de tempo para analisar a capacidade produtiva e identificar gargalos.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Estudo
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studies.map((study) => (
            <Link to={`/study/${study.id}`} key={study.id} className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {study.client}
                    <span className={`text-sm font-normal px-2 py-1 rounded-full ${
                      study.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                      study.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                    }`}>
                      {study.status === 'draft' ? 'Rascunho' : 
                       study.status === 'active' ? 'Ativo' : 'Arquivado'}
                    </span>
                  </CardTitle>
                  <CardDescription>{study.modelName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Responsável:</span>
                      <span>{study.responsiblePerson}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Data:</span>
                      <span>{format(new Date(study.studyDate), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Demanda Diária:</span>
                      <span>{study.dailyDemand} unidades</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Linhas:</span>
                      <span>{study.productionLines.length} linha(s)</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Criado em {format(new Date(study.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => handleExportStudy(e, study)}
                    >
                      <File className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={(e) => handleDeleteStudy(e, study)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir estudo</DialogTitle>
            <DialogDescription>
              {studyToDelete && (
                <>
                  Tem certeza que deseja excluir o estudo "{studyToDelete.client} - {studyToDelete.modelName}"?
                  Esta ação não pode ser desfeita.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteStudy}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BasePage>
  );
};

export default TimeStudies;
