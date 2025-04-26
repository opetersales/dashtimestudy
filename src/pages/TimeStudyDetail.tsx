
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BasePage } from '@/components/layout/BasePage';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { TimeStudy } from '@/utils/types';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { TimeStudyGeneralTab } from '@/components/timeStudy/TimeStudyGeneralTab';
import { TimeStudyLinesTab } from '@/components/timeStudy/TimeStudyLinesTab';
import { TimeStudyCalculationsTab } from '@/components/timeStudy/TimeStudyCalculationsTab';
import { TimeStudyReportsTab } from '@/components/timeStudy/TimeStudyReportsTab';
import { FileText, Save, Send } from 'lucide-react';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const TimeStudyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [study, setStudy] = useState<TimeStudy | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [publishJustification, setPublishJustification] = useState('');
  const [isLoading, setIsLoading] = useState({
    excel: false,
    pdf: false,
    publish: false,
    draft: false
  });

  useEffect(() => {
    if (!id) return;
    
    const studies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
    const foundStudy = studies.find(s => s.id === id);
    
    if (foundStudy) {
      setStudy(foundStudy);
    } else {
      navigate('/studies');
    }
  }, [id, navigate]);

  const getUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };

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

  const handleStudyUpdate = (updatedData: Partial<TimeStudy>) => {
    if (!study) return;
    
    const studies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
    
    const updatedStudy: TimeStudy = {
      ...study,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    
    const updatedStudies = studies.map(s => 
      s.id === updatedStudy.id ? updatedStudy : s
    );
    
    saveToLocalStorage('timeStudies', updatedStudies);
    setStudy(updatedStudy);
    
    window.dispatchEvent(new Event('dashboardUpdate'));
  };

  const handleExportExcel = async () => {
    if (!study) return;
    
    try {
      setIsLoading(prev => ({ ...prev, excel: true }));

      const workbook = XLSX.utils.book_new();
      
      // Informações Gerais
      const generalInfo = [{
        Cliente: study.client,
        Modelo: study.modelName,
        'Data do Estudo': new Date(study.studyDate).toLocaleDateString(),
        Responsável: study.responsiblePerson,
        'Demanda Mensal': study.monthlyDemand,
        'Dias Úteis': study.workingDays,
        'Demanda Diária': study.dailyDemand || 0,
        Status: study.status === 'active' ? 'Publicado' : 'Rascunho'
      }];
      const infoWs = XLSX.utils.json_to_sheet(generalInfo);
      XLSX.utils.book_append_sheet(workbook, infoWs, 'Informações');
      
      // Turnos
      const shiftsData = study.shifts.map(shift => ({
        Nome: shift.name,
        'Horas Trabalhadas': shift.hours,
        Ativo: shift.isActive ? 'Sim' : 'Não',
        'Takt Time': shift.taktTime || 'N/A'
      }));
      const shiftsWs = XLSX.utils.json_to_sheet(shiftsData);
      XLSX.utils.book_append_sheet(workbook, shiftsWs, 'Turnos');

      // Atividades
      const activitiesData: any[] = [];
      study.productionLines.forEach(line => {
        line.workstations.forEach(station => {
          station.activities.forEach(activity => {
            activitiesData.push({
              Linha: line.name,
              'Posto de Trabalho': station.number,
              Atividade: activity.description,
              Tipo: activity.type,
              'PF&D (%)': (activity.pfdFactor * 100).toFixed(1),
              'Média (s)': activity.averageNormalTime || 'N/A',
              'Tempo de Ciclo (s)': activity.cycleTime || 'N/A'
            });
          });
        });
      });
      const activitiesWs = XLSX.utils.json_to_sheet(activitiesData);
      XLSX.utils.book_append_sheet(workbook, activitiesWs, 'Atividades');

      // Exportar
      XLSX.writeFile(workbook, `estudo-${study.client}-${study.modelName}.xlsx`);
      
      toast({
        title: "Exportação concluída",
        description: "Arquivo Excel exportado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o arquivo Excel.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, excel: false }));
    }
  };

  const handleExportPDF = async () => {
    if (!study) return;

    try {
      setIsLoading(prev => ({ ...prev, pdf: true }));
      const element = document.getElementById('study-content');
      
      if (!element) {
        toast({
          title: "Erro ao exportar",
          description: "Conteúdo não encontrado para exportação.",
          variant: "destructive"
        });
        return;
      }

      const opt = {
        margin: 10,
        filename: `estudo-${study.client}-${study.modelName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "Exportação concluída",
        description: "PDF exportado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o PDF.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  const handlePublish = () => {
    if (!study || !publishJustification.trim() || publishJustification.length < 10) {
      toast({
        title: "Erro",
        description: "A justificativa precisa conter pelo menos 10 caracteres.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, publish: true }));
      
      const updatedStudy = {
        ...study,
        status: 'active' as const,
        updatedAt: new Date().toISOString()
      };
      
      handleStudyUpdate(updatedStudy);
      
      // Registra a justificativa no histórico
      updateHistory('publish', `Estudo publicado. Justificativa: ${publishJustification}`);
      
      setIsPublishDialogOpen(false);
      setPublishJustification('');
      
      toast({
        title: "Estudo publicado",
        description: "O estudo foi publicado com sucesso."
      });
    } finally {
      setIsLoading(prev => ({ ...prev, publish: false }));
    }
  };

  const handleSaveDraft = () => {
    if (!study) return;
    
    try {
      setIsLoading(prev => ({ ...prev, draft: true }));
      
      const updatedStudy = {
        ...study,
        status: 'draft' as const,
        updatedAt: new Date().toISOString()
      };
      
      handleStudyUpdate(updatedStudy);
      
      updateHistory('draft', `Estudo salvo como rascunho`);
      
      toast({
        title: "Rascunho salvo",
        description: "O estudo foi salvo como rascunho."
      });
    } finally {
      setIsLoading(prev => ({ ...prev, draft: false }));
    }
  };

  if (!study) {
    return (
      <BasePage title="Carregando...">
        <div className="flex justify-center items-center h-64">
          <p>Carregando dados do estudo...</p>
        </div>
      </BasePage>
    );
  }

  return (
    <BasePage title={`${study.client} - ${study.modelName}`}>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/studies')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Estudos
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportExcel} 
            disabled={isLoading.excel}
            className="min-w-[130px]"
          >
            {isLoading.excel ? (
              <span className="animate-pulse">Exportando...</span>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Exportar Excel
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            disabled={isLoading.pdf}
            className="min-w-[130px]"
          >
            {isLoading.pdf ? (
              <span className="animate-pulse">Exportando...</span>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={isLoading.draft}
            className="min-w-[150px]"
          >
            {isLoading.draft ? (
              <span className="animate-pulse">Salvando...</span>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Rascunho
              </>
            )}
          </Button>
          <Button 
            onClick={() => setIsPublishDialogOpen(true)}
            disabled={isLoading.publish}
            className="min-w-[120px]"
          >
            {isLoading.publish ? (
              <span className="animate-pulse">Publicando...</span>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Publicar
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div id="study-content" className="pb-20">
        <Tabs
          defaultValue="general"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="lines">Linhas e Postos</TabsTrigger>
            <TabsTrigger value="calculations">Cálculos</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <TimeStudyGeneralTab
              study={study}
              onStudyUpdate={handleStudyUpdate}
            />
          </TabsContent>
          
          <TabsContent value="lines">
            <TimeStudyLinesTab 
              study={study}
              onStudyUpdate={handleStudyUpdate}
              updateHistory={updateHistory}
            />
          </TabsContent>
          
          <TabsContent value="calculations">
            <TimeStudyCalculationsTab study={study} />
          </TabsContent>
          
          <TabsContent value="reports">
            <TimeStudyReportsTab study={study} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo de publicação com campo de justificativa */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publicar estudo</DialogTitle>
            <DialogDescription>
              Para publicar este estudo, forneça uma justificativa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="justification" className="text-sm font-medium mb-2 block">
              Justificativa para publicação*
            </label>
            <Textarea
              id="justification"
              placeholder="Ex: Estudo validado com os valores de UPH aprovados pelo supervisor da linha."
              value={publishJustification}
              onChange={(e) => setPublishJustification(e.target.value)}
              className="min-h-[100px]"
            />
            {publishJustification.length < 10 && publishJustification.length > 0 && (
              <p className="text-sm text-destructive mt-1">
                A justificativa deve conter pelo menos 10 caracteres.
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Caracteres: {publishJustification.length}/10 mínimo
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePublish} 
              disabled={publishJustification.length < 10}
            >
              Publicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BasePage>
  );
};

export default TimeStudyDetail;
