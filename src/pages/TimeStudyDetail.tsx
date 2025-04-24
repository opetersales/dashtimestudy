
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BasePage } from '@/components/layout/BasePage';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { TimeStudy, ProductionLine, Workstation } from '@/utils/types';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ArrowLeft, Edit, File, Plus, Trash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductionLineForm } from '@/components/timeStudy/ProductionLineForm';
import { TimeStudyGeneralTab } from '@/components/timeStudy/TimeStudyGeneralTab';
import { TimeStudyLinesTab } from '@/components/timeStudy/TimeStudyLinesTab';
import { TimeStudyCalculationsTab } from '@/components/timeStudy/TimeStudyCalculationsTab';
import { TimeStudyReportsTab } from '@/components/timeStudy/TimeStudyReportsTab';

const TimeStudyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [study, setStudy] = useState<TimeStudy | null>(null);
  const [isAddLineOpen, setIsAddLineOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);

  // Function to get current user name
  const getUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };

  // Load study data
  useEffect(() => {
    if (id) {
      const allStudies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
      const foundStudy = allStudies.find(study => study.id === id);
      
      if (foundStudy) {
        setStudy(foundStudy);
      } else {
        toast({
          title: "Estudo não encontrado",
          description: "O estudo solicitado não foi encontrado.",
          variant: "destructive"
        });
        navigate('/studies');
      }
      
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  // Function to update history
  const updateHistory = (action: string, details: string) => {
    if (!study) return;
    
    const history = loadFromLocalStorage<any[]>('history', []);
    const newHistoryItem = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString(),
      user: getUserName(),
      action: action,
      details: details,
      entityType: 'timeStudy',
      entityId: study.id,
      entityName: `${study.client} - ${study.modelName}`,
    };
    history.unshift(newHistoryItem);
    saveToLocalStorage('history', history);
  };

  // Save updated study
  const saveStudy = (updatedStudy: TimeStudy) => {
    const allStudies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
    const updatedStudies = allStudies.map(s => s.id === updatedStudy.id ? updatedStudy : s);
    saveToLocalStorage('timeStudies', updatedStudies);
    setStudy(updatedStudy);
  };

  const handleAddProductionLine = (lineData: Partial<ProductionLine>) => {
    if (!study) return;

    const newLine: ProductionLine = {
      id: `line-${Date.now()}`,
      name: lineData.name || 'Nova Linha',
      notes: lineData.notes || '',
      workstations: [],
    };

    const updatedStudy = {
      ...study,
      productionLines: [...study.productionLines, newLine],
      updatedAt: new Date().toISOString()
    };

    saveStudy(updatedStudy);
    updateHistory('update', `Adicionada linha de produção "${newLine.name}"`);

    toast({
      title: "Linha adicionada",
      description: `A linha "${newLine.name}" foi adicionada com sucesso.`
    });

    setIsAddLineOpen(false);
  };

  if (isLoading) {
    return (
      <BasePage>
        <div className="flex items-center justify-center h-48">
          <p>Carregando estudo...</p>
        </div>
      </BasePage>
    );
  }

  if (!study) {
    return (
      <BasePage>
        <div className="flex flex-col items-center justify-center h-48 space-y-4">
          <p>Estudo não encontrado</p>
          <Button onClick={() => navigate('/studies')}>Voltar para lista</Button>
        </div>
      </BasePage>
    );
  }

  return (
    <BasePage
      title={`${study.client} - ${study.modelName}`}
      subtitle={`Estudo de tempo criado em ${format(new Date(study.createdAt), 'dd/MM/yyyy')} por ${study.createdBy}`}
    >
      <div className="flex mb-6">
        <Button variant="outline" onClick={() => navigate('/studies')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1" />
        <Button variant="outline" className="mr-2">
          <File className="mr-2 h-4 w-4" />
          Exportar
        </Button>
        <Button variant="outline" className="mr-2">
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Dados Gerais</TabsTrigger>
          <TabsTrigger value="lines">Linhas e Postos</TabsTrigger>
          <TabsTrigger value="calculations">Cálculos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios e Gráficos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <TimeStudyGeneralTab study={study} />
        </TabsContent>

        <TabsContent value="lines" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsAddLineOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Linha
            </Button>
          </div>
          
          <TimeStudyLinesTab 
            study={study} 
            onStudyUpdate={saveStudy} 
            updateHistory={updateHistory} 
          />
        </TabsContent>

        <TabsContent value="calculations" className="space-y-4">
          <TimeStudyCalculationsTab study={study} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <TimeStudyReportsTab study={study} />
        </TabsContent>
      </Tabs>

      <Dialog open={isAddLineOpen} onOpenChange={setIsAddLineOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Linha de Produção</DialogTitle>
          </DialogHeader>
          <ProductionLineForm
            onSubmit={handleAddProductionLine}
            onCancel={() => setIsAddLineOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </BasePage>
  );
};

export default TimeStudyDetail;
