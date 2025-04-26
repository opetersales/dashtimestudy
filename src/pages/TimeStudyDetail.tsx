
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

const TimeStudyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [study, setStudy] = useState<TimeStudy | null>(null);
  const [activeTab, setActiveTab] = useState('general');

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

  // Function to get current user name
  const getUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };

  // Function to record history
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
    
    // Trigger dashboard update
    window.dispatchEvent(new Event('dashboardUpdate'));
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
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/studies')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Estudos
        </Button>
      </div>
      
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
    </BasePage>
  );
};

export default TimeStudyDetail;
