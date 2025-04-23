
import React, { useState } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { GboCard } from '@/components/gbo/GboCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Filter, Search } from 'lucide-react';
import { GBO } from '@/utils/types';
import { GboForm } from '@/components/gbo/GboForm';
import { useToast } from '@/components/ui/use-toast';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

const GBOs = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [gboToEdit, setGboToEdit] = useState<GBO | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gboToDelete, setGboToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Load GBOs from localStorage
  const [gbos, setGbos] = useState<GBO[]>(() => {
    const savedGbos = loadFromLocalStorage<GBO[]>('gboList', []);
    if (savedGbos.length === 0) {
      // Generate some mock data on first load
      const mockGbos = Array.from({ length: 6 }).map((_, i) => ({
        id: `gbo-${i}`,
        name: `GBO Linha ${i + 1}`,
        productModel: ['ModelA', 'ModelB', 'ModelC'][i % 3],
        productVariant: i % 2 === 0 ? 'Standard' : 'Premium',
        productionLine: `Line0${i % 3 + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Admin',
        version: '1.0',
        status: ['draft', 'active', 'archived'][i % 3] as any,
        cycleTime: 60 + i * 10,
        targetUPH: 80 + i * 5,
        actualUPH: 75 + i * (i % 2 ? 7 : 3),
        efficiency: 0.7 + (i % 3) * 0.1,
        operatorCount: 5 + i % 3,
        workstations: []
      }));
      saveToLocalStorage('gboList', mockGbos);
      return mockGbos;
    }
    return savedGbos;
  });

  // Filter GBOs based on search and status filter
  const filteredGbos = gbos.filter(gbo => {
    const matchesSearch = searchQuery === '' || 
      gbo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gbo.productModel.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === null || gbo.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleFormSubmit = (data: Partial<GBO>) => {
    if (gboToEdit) {
      // Update existing GBO
      const updatedGbos = gbos.map(gbo => 
        gbo.id === gboToEdit.id 
          ? { 
              ...gboToEdit, 
              ...data, 
              updatedAt: new Date().toISOString() 
            }
          : gbo
      );
      setGbos(updatedGbos);
      saveToLocalStorage('gboList', updatedGbos);
      toast({
        title: "GBO atualizado com sucesso",
        description: `${data.name} foi atualizado no sistema.`,
      });
    } else {
      // Create new GBO
      const newGbo: GBO = {
        id: `gbo-${Date.now()}`,
        name: data.name || 'Novo GBO',
        productModel: data.productModel || 'N/A',
        productVariant: data.productVariant || 'Standard',
        productionLine: data.productionLine || 'N/A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Admin',
        version: '1.0',
        status: 'draft',
        cycleTime: data.cycleTime || 60,
        targetUPH: data.targetUPH || 80,
        actualUPH: data.actualUPH || 75,
        efficiency: data.efficiency || 0.7,
        operatorCount: data.operatorCount || 5,
        workstations: []
      };
      
      const updatedGbos = [...gbos, newGbo];
      setGbos(updatedGbos);
      saveToLocalStorage('gboList', updatedGbos);
      
      toast({
        title: "GBO criado com sucesso",
        description: `${newGbo.name} foi adicionado ao sistema.`,
      });
    }
    
    setIsFormOpen(false);
    setGboToEdit(null);
  };

  const handleEdit = (gbo: GBO) => {
    setGboToEdit(gbo);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setGboToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (gboToDelete) {
      const updatedGbos = gbos.filter(gbo => gbo.id !== gboToDelete);
      setGbos(updatedGbos);
      saveToLocalStorage('gboList', updatedGbos);
      toast({
        title: "GBO removido",
        description: "O GBO foi removido com sucesso.",
      });
      setDeleteDialogOpen(false);
      setGboToDelete(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setGboToEdit(null);
  };

  return (
    <BasePage title="Gerenciamento de GBOs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar GBO..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('draft')}>
                Rascunho
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                Ativo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('archived')}>
                Arquivado
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo GBO
          </Button>
        </div>
      </div>

      {filteredGbos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGbos.map((gbo) => (
            <div key={gbo.id} className="relative group">
              <GboCard gbo={gbo} />
              
              <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit(gbo)}
                  className="bg-background/80 backdrop-blur-sm"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => confirmDelete(gbo.id)}
                  className="bg-background/80 backdrop-blur-sm text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery || filterStatus 
            ? "Nenhum GBO encontrado com os filtros selecionados"
            : "Nenhum GBO cadastrado. Clique no botão 'Novo GBO' para começar."
          }
        </div>
      )}
      
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{gboToEdit ? 'Editar GBO' : 'Criar Novo GBO'}</DialogTitle>
          </DialogHeader>
          <GboForm 
            initialData={gboToEdit || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este GBO? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BasePage>
  );
};

export default GBOs;

import { Pencil, Trash2 } from 'lucide-react';
