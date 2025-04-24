
import React, { useState } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
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
                    <span className="text-sm font-normal px-2 py-1 rounded-full bg-muted">
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
                <CardFooter>
                  <div className="w-full text-right text-sm text-muted-foreground">
                    Criado em {format(new Date(study.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
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
    </BasePage>
  );
};

export default TimeStudies;
