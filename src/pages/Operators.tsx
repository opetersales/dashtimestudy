
import React, { useState } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Button } from '@/components/ui/button';
import { Plus, Search, Pencil, Trash2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { useToast } from '@/components/ui/use-toast';
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
import { OperatorForm } from '@/components/operator/OperatorForm';

interface Operator {
  id: string;
  name: string;
  role: string;
  skills: string[];
  status: 'active' | 'training' | 'vacation' | 'inactive';
  workstation: string;
  hireDate?: string;
  certifications?: string[];
}

const Operators = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [operatorToEdit, setOperatorToEdit] = useState<Operator | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operatorToDelete, setOperatorToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Load operators from localStorage
  const [operators, setOperators] = useState<Operator[]>(() => {
    const savedOperators = loadFromLocalStorage<Operator[]>('operatorsList', []);
    if (savedOperators.length === 0) {
      // Generate some mock data on first load
      const mockOperators: Operator[] = [
        { id: '1', name: 'Carlos Silva', role: 'Operador Sênior', skills: ['Montagem', 'Teste'], status: 'active', workstation: 'Linha 01' },
        { id: '2', name: 'Maria Oliveira', role: 'Operador Pleno', skills: ['Montagem', 'Inspeção'], status: 'active', workstation: 'Linha 02' },
        { id: '3', name: 'João Santos', role: 'Operador Júnior', skills: ['Embalagem'], status: 'training', workstation: 'Linha 01' },
        { id: '4', name: 'Ana Costa', role: 'Operador Sênior', skills: ['Teste', 'Calibração'], status: 'vacation', workstation: 'Linha 03' },
        { id: '5', name: 'Pedro Almeida', role: 'Operador Pleno', skills: ['Montagem', 'Embalagem'], status: 'active', workstation: 'Linha 02' },
        { id: '6', name: 'Juliana Pereira', role: 'Operador Júnior', skills: ['Inspeção'], status: 'training', workstation: 'Linha 01' },
      ];
      saveToLocalStorage('operatorsList', mockOperators);
      return mockOperators;
    }
    return savedOperators;
  });

  // Filter operators based on search and status filter
  const filteredOperators = operators.filter(operator => {
    const matchesSearch = searchQuery === '' || 
      operator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operator.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operator.skills.some(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesFilter = filterStatus === null || operator.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleFormSubmit = (data: Partial<Operator>) => {
    if (operatorToEdit) {
      // Update existing operator
      const updatedOperators = operators.map(op => 
        op.id === operatorToEdit.id 
          ? { ...operatorToEdit, ...data } as Operator
          : op
      );
      setOperators(updatedOperators);
      saveToLocalStorage('operatorsList', updatedOperators);
      toast({
        title: "Operador atualizado",
        description: `${data.name} foi atualizado no sistema.`,
      });
    } else {
      // Create new operator
      const newOperator: Operator = {
        id: `op-${Date.now()}`,
        name: data.name || 'Novo Operador',
        role: data.role || 'Operador Júnior',
        skills: data.skills || [],
        status: data.status || 'active',
        workstation: data.workstation || 'Não alocado',
        hireDate: data.hireDate,
        certifications: data.certifications
      };
      
      const updatedOperators = [...operators, newOperator];
      setOperators(updatedOperators);
      saveToLocalStorage('operatorsList', updatedOperators);
      
      toast({
        title: "Operador adicionado",
        description: `${newOperator.name} foi adicionado ao sistema.`,
      });
    }
    
    setIsFormOpen(false);
    setOperatorToEdit(null);
  };

  const handleEdit = (operator: Operator) => {
    setOperatorToEdit(operator);
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setOperatorToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (operatorToDelete) {
      const updatedOperators = operators.filter(op => op.id !== operatorToDelete);
      setOperators(updatedOperators);
      saveToLocalStorage('operatorsList', updatedOperators);
      toast({
        title: "Operador removido",
        description: "O operador foi removido com sucesso.",
      });
      setDeleteDialogOpen(false);
      setOperatorToDelete(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setOperatorToEdit(null);
  };

  return (
    <BasePage title="Operadores">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar operador..." 
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
              <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                Ativo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('training')}>
                Em Treinamento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('vacation')}>
                Em Férias
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                Inativo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Operador
          </Button>
        </div>
      </div>
      
      {filteredOperators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOperators.map((operator) => (
            <Card key={operator.id} className="overflow-hidden group relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium">{operator.name}</CardTitle>
                  <Badge 
                    variant={
                      operator.status === 'active' ? 'default' : 
                      operator.status === 'training' ? 'secondary' : 
                      operator.status === 'vacation' ? 'outline' :
                      'destructive'
                    }
                  >
                    {operator.status === 'active' ? 'Ativo' : 
                     operator.status === 'training' ? 'Em Treinamento' : 
                     operator.status === 'vacation' ? 'Em Férias' :
                     'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`/placeholder.svg`} />
                    <AvatarFallback>{operator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">{operator.role}</p>
                    <p className="text-sm mt-1">Alocado: {operator.workstation}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {operator.skills.map(skill => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEdit(operator)}
                    className="bg-background/80 backdrop-blur-sm"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => confirmDelete(operator.id)}
                    className="bg-background/80 backdrop-blur-sm text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {searchQuery || filterStatus 
            ? "Nenhum operador encontrado com os filtros selecionados"
            : "Nenhum operador cadastrado. Clique no botão 'Novo Operador' para começar."
          }
        </div>
      )}
      
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{operatorToEdit ? 'Editar Operador' : 'Novo Operador'}</DialogTitle>
          </DialogHeader>
          <OperatorForm 
            initialData={operatorToEdit || undefined}
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
              Tem certeza que deseja excluir este operador? Esta ação não pode ser desfeita.
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

export default Operators;
