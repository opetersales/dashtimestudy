import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BasePage } from '@/components/layout/BasePage';
import { AtividadeForm } from '@/components/atividades/AtividadeForm';
import { AtividadesTable } from '@/components/atividades/AtividadesTable';
import { GboDataForm } from '@/components/atividades/GboDataForm';
import { GboDashboard } from '@/components/gbo/GboDashboard';
import { GboCard } from '@/components/gbo/GboCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { Atividade, GboData } from '@/types/atividades';
import { GBO } from '@/utils/types';
import { useToast } from '@/components/ui/use-toast';
import { WorkstationList } from '@/components/workstation/WorkstationList';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const GboDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gbo, setGbo] = useState<GBO | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [gboData, setGboData] = useState<GboData>({
    cliente: '',
    modelo: '',
    data: new Date().toISOString().split('T')[0],
    autor: '',
    horasTrabalhadas: 8,
    turno: 'Manhã',
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [atividadeToDelete, setAtividadeToDelete] = useState<string | null>(null);

  const getUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };

  useEffect(() => {
    const gbos = loadFromLocalStorage<GBO[]>('gboList', []);
    const currentGbo = gbos.find(g => g.id === id);
    
    if (currentGbo) {
      setGbo(currentGbo);
      
      const savedAtividades = loadFromLocalStorage<Atividade[]>(`atividades-${id}`, []);
      setAtividades(savedAtividades);
      
      const savedGboData = loadFromLocalStorage<GboData>(`gboData-${id}`, {
        cliente: currentGbo.name,
        modelo: currentGbo.productModel,
        data: new Date().toISOString().split('T')[0],
        autor: getUserName(),
        horasTrabalhadas: 8,
        turno: 'Manhã',
      });
      setGboData(savedGboData);
    } else {
      toast({
        title: "Erro",
        description: "GBO não encontrado",
        variant: "destructive",
      });
      navigate('/gbos');
    }
  }, [id, navigate, toast]);

  const updateHistory = (action: string, details: string) => {
    const history = loadFromLocalStorage<any[]>('history', []);
    const newHistoryItem = {
      id: `hist-${Date.now()}`,
      name: gbo?.name || 'GBO',
      version: gbo?.version || '1.0',
      date: new Date().toISOString(),
      user: getUserName(),
      action: action === 'create' ? 'create' : action === 'delete' ? 'archive' : 'update',
      details,
    };
    history.unshift(newHistoryItem);
    saveToLocalStorage('history', history);
  };

  const handleGboDataSubmit = (data: GboData) => {
    setGboData(data);
    saveToLocalStorage(`gboData-${id}`, data);
    toast({
      title: "Dados atualizados",
      description: "Dados do GBO foram salvos com sucesso.",
    });
    updateHistory('update', 'Atualização dos dados gerais do GBO');
  };

  const handleAtividadeSubmit = (atividade: Atividade) => {
    let updatedAtividades: Atividade[];
    const existingIndex = atividades.findIndex(a => a.id === atividade.id);
    
    if (existingIndex >= 0) {
      updatedAtividades = [
        ...atividades.slice(0, existingIndex),
        atividade,
        ...atividades.slice(existingIndex + 1)
      ];
      toast({
        title: "Atividade atualizada",
        description: "A atividade foi atualizada com sucesso.",
      });
      updateHistory('update', `Atualização da atividade: ${atividade.descricao}`);
    } else {
      updatedAtividades = [...atividades, atividade];
      toast({
        title: "Atividade adicionada",
        description: "Nova atividade adicionada com sucesso.",
      });
      updateHistory('create', `Criação de nova atividade: ${atividade.descricao}`);
    }
    
    setAtividades(updatedAtividades);
    saveToLocalStorage(`atividades-${id}`, updatedAtividades);
  };

  const handleEditAtividade = (id: string) => {
  };

  const confirmDeleteAtividade = (id: string) => {
    setAtividadeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAtividade = () => {
    if (atividadeToDelete) {
      const atividadeToRemove = atividades.find(a => a.id === atividadeToDelete);
      const updatedAtividades = atividades.filter(a => a.id !== atividadeToDelete);
      setAtividades(updatedAtividades);
      saveToLocalStorage(`atividades-${id}`, updatedAtividades);
      toast({
        title: "Atividade excluída",
        description: "A atividade foi removida com sucesso.",
      });
      updateHistory('delete', `Remoção da atividade: ${atividadeToRemove?.descricao || 'Desconhecida'}`);
      setDeleteDialogOpen(false);
      setAtividadeToDelete(null);
    }
  };

  const workstations = React.useMemo(() => {
    if (!atividades.length) return [];
    
    const postoMap = new Map();
    
    atividades.forEach(atividade => {
      const posto = postoMap.get(atividade.posto) || {
        id: `ws-${atividade.posto}`,
        name: atividade.posto,
        position: parseInt(atividade.posto.replace(/\D/g, '')) || 0,
        activities: [],
        cycleTime: 0,
        efficiency: 0,
        status: 'normal'
      };
      
      posto.activities.push({
        id: atividade.id,
        name: atividade.descricao,
        timeRequired: atividade.cycleTimeAjustado
      });
      
      posto.cycleTime += atividade.cycleTimeAjustado;
      
      postoMap.set(atividade.posto, posto);
    });
    
    const tempoCicloMaximo = Math.max(...Array.from(postoMap.values()).map(p => p.cycleTime));
    
    return Array.from(postoMap.values()).map(posto => {
      const efficiency = tempoCicloMaximo > 0 ? posto.cycleTime / tempoCicloMaximo : 1;
      
      let status: 'optimal' | 'normal' | 'warning' | 'bottleneck';
      if (efficiency > 0.95) {
        status = 'bottleneck';
      } else if (efficiency > 0.85) {
        status = 'warning';
      } else if (efficiency < 0.6) {
        status = 'normal';
      } else {
        status = 'optimal';
      }
      
      return {
        ...posto,
        efficiency,
        status
      };
    });
  }, [atividades]);

  if (!gbo) {
    return null;
  }

  return (
    <BasePage title={`Detalhes do GBO - ${gbo.name}`}>
      <div className="mb-4 flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/gbos')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para GBOs
        </Button>
      </div>

      <div className="mb-6 max-w-md">
        <GboCard gbo={gbo} />
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
          <TabsTrigger value="postos">Postos de Trabalho</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <GboDashboard gbo={gbo} atividades={atividades} />
        </TabsContent>
        
        <TabsContent value="dados" className="space-y-4">
          <GboDataForm 
            initialData={gboData} 
            onSubmit={handleGboDataSubmit} 
          />
        </TabsContent>
        
        <TabsContent value="atividades" className="space-y-4">
          <AtividadeForm 
            atividades={atividades}
            onSubmit={handleAtividadeSubmit} 
          />
          <AtividadesTable 
            atividades={atividades}
            onEdit={handleEditAtividade}
            onDelete={confirmDeleteAtividade}
          />
        </TabsContent>
        
        <TabsContent value="postos" className="space-y-4">
          <WorkstationList 
            workstations={workstations}
            onWorkstationClick={(ws) => {
              toast({
                title: `${ws.name}`,
                description: `Tempo de ciclo: ${ws.cycleTime?.toFixed(1)}s, Eficiência: ${Math.round((ws.efficiency || 0) * 100)}%`,
              });
            }}
          />
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAtividade}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BasePage>
  );
};

export default GboDetail;
