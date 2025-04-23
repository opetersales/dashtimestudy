
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BasePage } from '@/components/layout/BasePage';
import { AtividadeForm } from '@/components/atividades/AtividadeForm';
import { AtividadesTable } from '@/components/atividades/AtividadesTable';
import { AtividadesCharts } from '@/components/atividades/AtividadesCharts';
import { GboDataForm } from '@/components/atividades/GboDataForm';
import { GboCard } from '@/components/gbo/GboCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { Atividade, GboData } from '@/types/atividades';
import { GBO } from '@/utils/types';
import { useToast } from '@/components/ui/use-toast';
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

  useEffect(() => {
    // Load GBO data
    const gbos = loadFromLocalStorage<GBO[]>('gboList', []);
    const currentGbo = gbos.find(g => g.id === id);
    
    if (currentGbo) {
      setGbo(currentGbo);
      
      // Load activities for this GBO
      const savedAtividades = loadFromLocalStorage<Atividade[]>(`atividades-${id}`, []);
      setAtividades(savedAtividades);
      
      // Load GBO analysis data
      const savedGboData = loadFromLocalStorage<GboData>(`gboData-${id}`, {
        cliente: currentGbo.name,
        modelo: currentGbo.productModel,
        data: new Date().toISOString().split('T')[0],
        autor: 'Admin',
        horasTrabalhadas: 8,
        turno: 'Manhã',
      });
      setGboData(savedGboData);
    } else {
      // GBO not found, navigate back to GBO list
      toast({
        title: "Erro",
        description: "GBO não encontrado",
        variant: "destructive",
      });
      navigate('/gbos');
    }
  }, [id, navigate, toast]);

  const handleGboDataSubmit = (data: GboData) => {
    setGboData(data);
    saveToLocalStorage(`gboData-${id}`, data);
    toast({
      title: "Dados atualizados",
      description: "Dados do GBO foram salvos com sucesso.",
    });
  };

  const handleAtividadeSubmit = (atividade: Atividade) => {
    let updatedAtividades: Atividade[];
    const existingIndex = atividades.findIndex(a => a.id === atividade.id);
    
    if (existingIndex >= 0) {
      // Update existing activity
      updatedAtividades = [
        ...atividades.slice(0, existingIndex),
        atividade,
        ...atividades.slice(existingIndex + 1)
      ];
      toast({
        title: "Atividade atualizada",
        description: "A atividade foi atualizada com sucesso.",
      });
    } else {
      // Add new activity
      updatedAtividades = [...atividades, atividade];
      toast({
        title: "Atividade adicionada",
        description: "Nova atividade adicionada com sucesso.",
      });
    }
    
    setAtividades(updatedAtividades);
    saveToLocalStorage(`atividades-${id}`, updatedAtividades);
  };

  const handleEditAtividade = (id: string) => {
    // The URL params will be handled by AtividadeForm component
  };

  const confirmDeleteAtividade = (id: string) => {
    setAtividadeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAtividade = () => {
    if (atividadeToDelete) {
      const updatedAtividades = atividades.filter(a => a.id !== atividadeToDelete);
      setAtividades(updatedAtividades);
      saveToLocalStorage(`atividades-${id}`, updatedAtividades);
      toast({
        title: "Atividade excluída",
        description: "A atividade foi removida com sucesso.",
      });
      setDeleteDialogOpen(false);
      setAtividadeToDelete(null);
    }
  };

  if (!gbo) {
    return null; // Loading state
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

      <Tabs defaultValue="dados" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dados">Dados Gerais</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
          <TabsTrigger value="analise">Análise e Gráficos</TabsTrigger>
        </TabsList>
        
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
        
        <TabsContent value="analise" className="space-y-4">
          <AtividadesCharts 
            atividades={atividades} 
            horasTrabalhadas={gboData.horasTrabalhadas}
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
