
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { GboDataForm } from '@/components/atividades/GboDataForm';
import { AtividadeForm } from '@/components/atividades/AtividadeForm';
import { AtividadesTable } from '@/components/atividades/AtividadesTable';
import { AtividadesCharts } from '@/components/atividades/AtividadesCharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

export interface GboData {
  cliente: string;
  modelo: string;
  data: string;
  autor: string;
  horasTrabalhadas: number;
  turno: 'Manhã' | 'Tarde' | 'Noite';
}

export interface Atividade {
  id: string;
  posto: string;
  descricao: string;
  cycleTime: number;
  fadiga: number;
  cycleTimeAjustado: number;
}

const AnaliseAtividades = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [gboData, setGboData] = useState<GboData>(() => {
    const savedData = localStorage.getItem('gboData');
    return savedData ? JSON.parse(savedData) : {
      cliente: '',
      modelo: '',
      data: '',
      autor: '',
      horasTrabalhadas: 8,
      turno: 'Manhã'
    };
  });

  const [atividades, setAtividades] = useState<Atividade[]>(() => {
    const savedAtividades = localStorage.getItem('atividades');
    return savedAtividades ? JSON.parse(savedAtividades) : [];
  });

  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('gboData', JSON.stringify(gboData));
  }, [gboData]);

  useEffect(() => {
    localStorage.setItem('atividades', JSON.stringify(atividades));
  }, [atividades]);

  // Apply dark theme class to the html element
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleGboDataSubmit = (data: GboData) => {
    setGboData(data);
    toast({
      title: "Dados do GBO atualizados",
      description: "Os dados gerais do GBO foram atualizados com sucesso.",
    });
  };

  const handleAtividadeSubmit = (atividade: Atividade) => {
    const isEditing = atividades.some(a => a.id === atividade.id);
    
    if (isEditing) {
      setAtividades(atividades.map(a => a.id === atividade.id ? atividade : a));
      toast({
        title: "Atividade atualizada",
        description: `A atividade "${atividade.descricao}" foi atualizada.`,
      });
    } else {
      setAtividades([...atividades, atividade]);
      toast({
        title: "Atividade adicionada",
        description: `A atividade "${atividade.descricao}" foi adicionada.`,
      });
    }
  };

  const handleAtividadeEdit = (id: string) => {
    // O formulário de atividade se encarregará de buscar a atividade pelo ID
    document.getElementById('atividade-form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAtividadeDelete = (id: string) => {
    setAtividades(atividades.filter(a => a.id !== id));
    toast({
      title: "Atividade removida",
      description: "A atividade foi removida com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header 
          sidebarCollapsed={sidebarCollapsed} 
          onToggleTheme={toggleTheme} 
          isDarkTheme={isDarkTheme} 
        />
        
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col mb-6">
            <h1 className="text-2xl font-bold mb-4">Análise de Atividades</h1>

            <Alert className="mb-4">
              <AlertDescription>
                Preencha os dados do GBO e adicione as atividades para gerar análises e gráficos.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="gbo" className="space-y-6">
              <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4">
                <TabsTrigger value="gbo">GBO</TabsTrigger>
                <TabsTrigger value="atividades">Atividades</TabsTrigger>
                <TabsTrigger value="tabela">Tabela</TabsTrigger>
                <TabsTrigger value="graficos">Gráficos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="gbo" className="space-y-4">
                <GboDataForm initialData={gboData} onSubmit={handleGboDataSubmit} />
              </TabsContent>
              
              <TabsContent value="atividades" className="space-y-4">
                <div id="atividade-form-section">
                  <AtividadeForm 
                    atividades={atividades} 
                    onSubmit={handleAtividadeSubmit} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="tabela" className="space-y-4">
                <AtividadesTable 
                  atividades={atividades}
                  onEdit={handleAtividadeEdit}
                  onDelete={handleAtividadeDelete}
                />
              </TabsContent>
              
              <TabsContent value="graficos" className="space-y-4">
                <AtividadesCharts 
                  atividades={atividades}
                  horasTrabalhadas={gboData.horasTrabalhadas}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnaliseAtividades;
