
import React, { useState, useEffect } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { GboDataForm } from '@/components/atividades/GboDataForm';
import { AtividadeForm } from '@/components/atividades/AtividadeForm';
import { AtividadesTable } from '@/components/atividades/AtividadesTable';
import { AtividadesCharts } from '@/components/atividades/AtividadesCharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { GboData, Atividade } from '@/types/atividades';
import { saveToLocalStorage, loadFromLocalStorage } from '@/services/localStorage';

const AnaliseAtividades = () => {
  const [gboData, setGboData] = useState<GboData>(() => 
    loadFromLocalStorage<GboData>('gboData', {
      cliente: '',
      modelo: '',
      data: '',
      autor: '',
      horasTrabalhadas: 8,
      turno: 'Manhã'
    })
  );

  const [atividades, setAtividades] = useState<Atividade[]>(() => 
    loadFromLocalStorage<Atividade[]>('atividades', [])
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [atividadeToDelete, setAtividadeToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    saveToLocalStorage('gboData', gboData);
  }, [gboData]);

  useEffect(() => {
    saveToLocalStorage('atividades', atividades);
  }, [atividades]);

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

  const confirmDelete = (id: string) => {
    setAtividadeToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleAtividadeDelete = () => {
    if (atividadeToDelete) {
      setAtividades(atividades.filter(a => a.id !== atividadeToDelete));
      toast({
        title: "Atividade removida",
        description: "A atividade foi removida com sucesso.",
      });
      setDeleteDialogOpen(false);
      setAtividadeToDelete(null);
    }
  };

  return (
    <BasePage title="Análise de Atividades">
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
            onDelete={confirmDelete}
          />
        </TabsContent>
        
        <TabsContent value="graficos" className="space-y-4">
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
            <AlertDialogAction onClick={handleAtividadeDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BasePage>
  );
};

export default AnaliseAtividades;
