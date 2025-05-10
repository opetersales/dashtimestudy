
import React, { useState, useEffect } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, FileText, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { TimeStudyForm } from '@/components/timeStudy/TimeStudyForm';
import { TimeStudy } from '@/utils/types';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { getCurrentProfile } from '@/services/auth';

const TimeStudies: React.FC = () => {
  const [studies, setStudies] = useState<TimeStudy[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<TimeStudy[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<TimeStudy | null>(null);
  const [studyToDelete, setStudyToDelete] = useState<TimeStudy | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const user = getCurrentProfile();

  useEffect(() => {
    // Carregar estudos do Supabase
    const loadStudies = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('time_studies')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Erro ao carregar estudos:", error);
          toast({
            title: "Erro ao carregar estudos",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data) {
          // Converter dados do Supabase para o formato TimeStudy
          const mappedStudies = data.map(study => ({
            id: study.id,
            client: study.client,
            modelName: study.model_name,
            studyDate: study.study_date || new Date().toISOString(),
            responsiblePerson: study.responsible_person || '',
            monthlyDemand: study.monthly_demand || 0,
            workingDays: study.working_days || 22,
            dailyDemand: study.daily_demand || 0,
            productionLines: [],
            shifts: [],
            createdAt: study.created_at || new Date().toISOString(),
            updatedAt: study.updated_at || new Date().toISOString(),
            createdBy: user.name,
            version: study.version || '1.0',
            status: study.status || 'draft'
          }));
          
          setStudies(mappedStudies);
          applyFiltersAndSort(mappedStudies, statusFilter, sortOrder);
        }
      } catch (error) {
        console.error("Erro ao carregar estudos:", error);
      }
    };

    loadStudies();

    // Adicionar um listener para atualizar os estudos quando houver mudanças
    const handleDashboardUpdate = () => {
      loadStudies();
    };

    window.addEventListener('dashboardUpdate', handleDashboardUpdate);
    
    return () => {
      window.removeEventListener('dashboardUpdate', handleDashboardUpdate);
    };
  }, [user, toast, statusFilter, sortOrder]);

  // Aplicar filtros e ordenação
  const applyFiltersAndSort = (
    studiesData: TimeStudy[], 
    status: string | null,
    order: 'asc' | 'desc'
  ) => {
    let result = [...studiesData];
    
    // Aplicar filtro por status
    if (status) {
      result = result.filter(study => study.status === status);
    }
    
    // Aplicar ordenação
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredStudies(result);
  };
  
  // Atualizar filtros
  const handleStatusFilterChange = (value: string) => {
    const filter = value === 'all' ? null : value;
    setStatusFilter(filter);
    applyFiltersAndSort(studies, filter, sortOrder);
  };
  
  // Alternar ordenação
  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    applyFiltersAndSort(studies, statusFilter, newOrder);
  };

  // Atualizar histórico
  const updateHistory = async (action: string, details: string, studyName: string) => {
    if (!user) return;
    
    try {
      await supabase.from('history').insert([{
        user_id: user.id,
        action: action,
        details: details,
        entity_type: 'timeStudy',
        entity_id: Date.now().toString(),
        entity_name: studyName
      }]);
    } catch (error) {
      console.error('Erro ao registrar histórico:', error);
    }
  };
  
  const handleOpenStudy = (id: string) => {
    navigate(`/study/${id}`);
  };

  const handleDeleteStudy = (e: React.MouseEvent, study: TimeStudy) => {
    e.preventDefault();
    e.stopPropagation();
    setStudyToDelete(study);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteStudy = async () => {
    if (!studyToDelete || !user) return;
    
    try {
      const { error } = await supabase
        .from('time_studies')
        .delete()
        .eq('id', studyToDelete.id)
        .eq('user_id', user.id);
      
      if (error) {
        toast({
          title: "Erro ao excluir estudo",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      const updatedStudies = studies.filter(s => s.id !== studyToDelete.id);
      setStudies(updatedStudies);
      applyFiltersAndSort(updatedStudies, statusFilter, sortOrder);
      
      updateHistory(
        'delete',
        `Exclusão do estudo ${studyToDelete.client} - ${studyToDelete.modelName}`,
        `${studyToDelete.client} - ${studyToDelete.modelName}`
      );
      
      toast({
        title: "Estudo excluído",
        description: `${studyToDelete.client} - ${studyToDelete.modelName} foi excluído com sucesso.`,
      });
      
      setIsDeleteDialogOpen(false);
      setStudyToDelete(null);
      
      window.dispatchEvent(new Event('dashboardUpdate'));
    } catch (error) {
      console.error("Erro ao excluir estudo:", error);
    }
  };

  const handleExportStudy = (e: React.MouseEvent, study: TimeStudy) => {
    e.preventDefault();
    e.stopPropagation();
    
    const blob = new Blob([JSON.stringify(study, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudo_${study.client}_${study.modelName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Estudo exportado",
      description: "Os dados do estudo foram exportados com sucesso."
    });
    
    updateHistory(
      'export',
      `Exportação do estudo ${study.client} - ${study.modelName}`,
      `${study.client} - ${study.modelName}`
    );
  };

  const handleFormSubmit = async (data: any) => {
    if (!user) return;
    
    // Processar a data para garantir que seja string
    const studyDate = data.studyDate instanceof Date
      ? data.studyDate.toISOString()
      : new Date(data.studyDate).toISOString();
    
    try {
      if (selectedStudy) {
        // Atualizar estudo existente
        const { error } = await supabase
          .from('time_studies')
          .update({
            client: data.client,
            model_name: data.modelName,
            study_date: studyDate,
            responsible_person: data.responsiblePerson,
            monthly_demand: data.monthlyDemand,
            working_days: data.workingDays,
            daily_demand: data.monthlyDemand && data.workingDays 
              ? Math.round(data.monthlyDemand / data.workingDays) 
              : 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedStudy.id)
          .eq('user_id', user.id);
        
        if (error) {
          toast({
            title: "Erro ao atualizar estudo",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Estudo atualizado",
          description: `${data.client} - ${data.modelName} foi atualizado com sucesso.`,
        });
        
        updateHistory(
          'update',
          `Atualização do estudo ${data.client} - ${data.modelName}`,
          `${data.client} - ${data.modelName}`
        );
      } else {
        // Criar novo estudo
        const { error } = await supabase
          .from('time_studies')
          .insert([{
            user_id: user.id,
            client: data.client,
            model_name: data.modelName,
            study_date: studyDate,
            responsible_person: data.responsiblePerson,
            monthly_demand: data.monthlyDemand,
            working_days: data.workingDays,
            daily_demand: data.monthlyDemand && data.workingDays 
              ? Math.round(data.monthlyDemand / data.workingDays) 
              : 0,
            status: 'draft',
            version: '1.0'
          }]);
        
        if (error) {
          toast({
            title: "Erro ao criar estudo",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Estudo criado",
          description: `${data.client} - ${data.modelName} foi criado como rascunho. Adicione linhas e postos de trabalho.`,
        });
        
        updateHistory(
          'create',
          `Criação do estudo de tempo ${data.client} - ${data.modelName}`,
          `${data.client} - ${data.modelName}`
        );
      }
      
      setIsFormOpen(false);
      setSelectedStudy(null);
      
      window.dispatchEvent(new Event('dashboardUpdate'));
    } catch (error) {
      console.error("Erro ao salvar estudo:", error);
    }
  };

  // Função auxiliar para obter a cor do badge baseado no status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'active':
        return 'default';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Função auxiliar para obter o texto do badge baseado no status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'active':
        return 'Publicado';
      case 'archived':
        return 'Arquivado';
      default:
        return 'Rascunho';
    }
  };

  return (
    <BasePage title="Estudos de Tempo">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div className="flex gap-2 flex-wrap">
          <Select 
            defaultValue="all" 
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="draft">Rascunhos</SelectItem>
              <SelectItem value="active">Publicados</SelectItem>
              <SelectItem value="archived">Arquivados</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={toggleSortOrder}>
            {sortOrder === 'asc' ? (
              <>
                <ArrowUp className="mr-2 h-4 w-4" />
                Mais antigos
              </>
            ) : (
              <>
                <ArrowDown className="mr-2 h-4 w-4" />
                Mais recentes
              </>
            )}
          </Button>
        </div>
        
        <Button onClick={() => { setSelectedStudy(null); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Estudo
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudies.map(study => (
          <Card 
            key={study.id} 
            className="relative hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => handleOpenStudy(study.id)}
          >
            <CardHeader>
              <CardTitle className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span>{study.client}</span>
                  <Badge variant={getStatusBadgeVariant(study.status)}>
                    {getStatusText(study.status)}
                  </Badge>
                </div>
                <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedStudy(study);
                      setIsFormOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => handleDeleteStudy(e, study)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => handleExportStudy(e, study)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Modelo:</span> {study.modelName}
                </div>
                <div>
                  <span className="font-medium">Data:</span> {new Date(study.studyDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Responsável:</span> {study.responsiblePerson}
                </div>
                <div>
                  <span className="font-medium">Demanda Mensal:</span> {study.monthlyDemand.toLocaleString()} unidades
                </div>
                <div>
                  <span className="font-medium">Linhas de Produção:</span> {study.productionLines?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Turnos:</span> {study.shifts?.length || 0}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredStudies.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
            <p className="text-lg mb-4">
              {statusFilter ? 'Nenhum estudo encontrado com o status selecionado.' : 'Nenhum estudo de tempo cadastrado ainda.'}
            </p>
            <Button onClick={() => { setSelectedStudy(null); setIsFormOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              {statusFilter ? 'Criar Novo Estudo' : 'Criar Primeiro Estudo'}
            </Button>
          </div>
        )}
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{selectedStudy ? 'Editar Estudo' : 'Novo Estudo'}</DialogTitle>
          </DialogHeader>
          <TimeStudyForm
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsFormOpen(false);
              setSelectedStudy(null);
            }}
            isEdit={!!selectedStudy}
            initialData={selectedStudy || undefined}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir o estudo "{studyToDelete?.client} - {studyToDelete?.modelName}"?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteStudy}
            >
              Excluir Estudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BasePage>
  );
};

export default TimeStudies;
