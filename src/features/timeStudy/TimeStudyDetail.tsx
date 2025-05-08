
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BasePage } from '@/components/layout/BasePage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimeStudy } from '@/utils/types';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { TimeStudyGeneralTab } from '@/components/timeStudy/TimeStudyGeneralTab';
import { TimeStudyLinesTab } from '@/components/timeStudy/TimeStudyLinesTab';
import { TimeStudyCalculationsTab } from '@/components/timeStudy/TimeStudyCalculationsTab';
import { TimeStudyReportsTab } from '@/features/reports/components/TimeStudyReportsTab';
import { TimeStudyHeader } from './components/TimeStudyHeader';
import { TimeStudyExport } from './components/TimeStudyExport';
import { TimeStudyStatusManager } from './components/TimeStudyStatusManager';

/**
 * Página de detalhes de um estudo de tempo
 * Exibe e permite edição de informações detalhadas sobre o estudo
 */
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
        <TimeStudyHeader study={study} />
        <div className="flex flex-wrap gap-2">
          <TimeStudyExport study={study} />
          <TimeStudyStatusManager 
            study={study} 
            onStudyUpdate={handleStudyUpdate} 
            updateHistory={updateHistory} 
          />
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
    </BasePage>
  );
};

export default TimeStudyDetail;
