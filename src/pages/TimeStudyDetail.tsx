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

const TimeStudyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [study, setStudy] = useState<TimeStudy | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();

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

  const handleExportExcel = () => {
    if (!study) return;

    const workbook = XLSX.utils.book_new();
    
    const shiftsData = study.shifts.map(shift => ({
      Nome: shift.name,
      'Horas Trabalhadas': shift.hours,
      Ativo: shift.isActive ? 'Sim' : 'Não',
      'Takt Time': shift.taktTime || 'N/A'
    }));
    const shiftsWs = XLSX.utils.json_to_sheet(shiftsData);
    XLSX.utils.book_append_sheet(workbook, shiftsWs, 'Turnos');

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

    XLSX.writeFile(workbook, `estudo-${study.client}-${study.modelName}.xlsx`);
  };

  const handleExportPDF = async () => {
    if (!study) return;

    const element = document.getElementById('study-content');
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `estudo-${study.client}-${study.modelName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(element).save();
  };

  const handlePublish = () => {
    if (!study) return;
    
    const updatedStudy = {
      ...study,
      status: 'active' as const,
      updatedAt: new Date().toISOString()
    };
    
    handleStudyUpdate(updatedStudy);
    toast({
      title: "Estudo publicado",
      description: "O estudo foi publicado com sucesso."
    });
  };

  const handleSaveDraft = () => {
    if (!study) return;
    
    const updatedStudy = {
      ...study,
      status: 'draft' as const,
      updatedAt: new Date().toISOString()
    };
    
    handleStudyUpdate(updatedStudy);
    toast({
      title: "Rascunho salvo",
      description: "O estudo foi salvo como rascunho."
    });
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
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/studies')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Estudos
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Rascunho
          </Button>
          <Button onClick={handlePublish}>
            <Send className="mr-2 h-4 w-4" />
            Publicar
          </Button>
        </div>
      </div>
      
      <div id="study-content">
        <Tabs
          defaultValue="general"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-4 mb-4">
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
    </BasePage>
  );
};

export default TimeStudyDetail;
