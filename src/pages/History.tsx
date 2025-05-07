
import React, { useState } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, Eye, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { loadFromLocalStorage } from '@/services/localStorage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as XLSX from 'xlsx';

interface HistoryItem {
  id: string;
  name: string;
  date: string;
  user: string;
  action: 'update' | 'create' | 'archive';
  details: string;
  entityName?: string;
}

const History = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Load history from localStorage
  const [historyItems] = useState<HistoryItem[]>(() => {
    const savedHistory = loadFromLocalStorage<HistoryItem[]>('history', []);
    if (savedHistory.length === 0) {
      // Generate mock data
      const mockHistory: HistoryItem[] = [
        { id: '1', name: 'GBO Linha 01', entityName: 'GBO Linha 01', date: '2025-04-19', user: 'Carlos Silva', action: 'update', details: 'Atualização de tempos de ciclo' },
        { id: '2', name: 'GBO Linha 02', entityName: 'GBO Linha 02', date: '2025-04-18', user: 'Maria Oliveira', action: 'create', details: 'Criação inicial do GBO' },
        { id: '3', name: 'GBO Linha 01', entityName: 'GBO Linha 01', date: '2025-04-17', user: 'João Santos', action: 'update', details: 'Adição de posto de trabalho' },
        { id: '4', name: 'GBO Linha 03', entityName: 'GBO Linha 03', date: '2025-04-16', user: 'Ana Costa', action: 'archive', details: 'Arquivamento da versão anterior' },
        { id: '5', name: 'GBO Linha 01', entityName: 'GBO Linha 01', date: '2025-04-15', user: 'Carlos Silva', action: 'create', details: 'Criação inicial do GBO' },
        { id: '6', name: 'GBO Linha 04', entityName: 'GBO Linha 04', date: '2025-04-14', user: 'Pedro Almeida', action: 'update', details: 'Redistribuição de atividades' },
      ];
      return mockHistory;
    }
    return savedHistory.map(item => ({
      ...item,
      // Ensure entityName is populated for existing items
      entityName: item.entityName || item.name
    }));
  });

  // Filter history items
  const filteredItems = historyItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterAction === null || item.action === filterAction;
    
    return matchesSearch && matchesFilter;
  });

  const handleExportExcel = () => {
    const data = historyItems.map(item => ({
      GBO: item.entityName || item.name,
      Data: format(new Date(item.date), 'dd/MM/yyyy'),
      Usuário: item.user,
      Ação: item.action === 'create' ? 'Criação' :
            item.action === 'update' ? 'Atualização' : 'Arquivamento',
      Detalhes: item.details
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    
    const wscols = [
      { wch: 20 }, // GBO
      { wch: 12 }, // Data
      { wch: 15 }, // Usuário
      { wch: 15 }, // Ação
      { wch: 40 }, // Detalhes
    ];
    ws['!cols'] = wscols;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Histórico');
    
    XLSX.writeFile(wb, 'historico_gbo.xlsx');
  };

  const viewDetails = (item: HistoryItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const renderActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <Badge>Criação</Badge>;
      case 'update':
        return <Badge variant="secondary">Atualização</Badge>;
      case 'archive':
        return <Badge variant="outline">Arquivamento</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <BasePage title="Histórico">
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar no histórico..." 
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
            <DropdownMenuLabel>Tipo de Ação</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setFilterAction(null)}>
              Todas
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterAction('update')}>
              Atualizações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterAction('create')}>
              Criações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterAction('archive')}>
              Arquivamentos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" onClick={handleExportExcel}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="mb-2">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="updates">Atualizações</TabsTrigger>
          <TabsTrigger value="creations">Criações</TabsTrigger>
          <TabsTrigger value="archives">Arquivamentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Histórico Completo</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-2 py-3 text-left">GBO</th>
                        <th className="px-2 py-3 text-left">Data</th>
                        <th className="px-2 py-3 text-left">Usuário</th>
                        <th className="px-2 py-3 text-left">Ação</th>
                        <th className="px-2 py-3 text-left">Detalhes</th>
                        <th className="px-2 py-3 text-right">Visualizar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="px-2 py-3">{item.entityName || item.name}</td>
                          <td className="px-2 py-3">{format(new Date(item.date), 'dd/MM/yyyy', { locale: ptBR })}</td>
                          <td className="px-2 py-3">{item.user}</td>
                          <td className="px-2 py-3">
                            {renderActionBadge(item.action)}
                          </td>
                          <td className="px-2 py-3">
                            <div className="max-w-[200px] truncate" title={item.details}>
                              {item.details}
                            </div>
                          </td>
                          <td className="px-2 py-3 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => viewDetails(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="updates">
          <Card>
            <CardContent className="pt-6">
              {filteredItems
                .filter(item => item.action === 'update')
                .map(item => (
                  <div key={item.id} className="flex flex-col gap-1 border-b py-3 last:border-0">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.entityName || item.name}</h3>
                      <Badge variant="secondary">Atualização</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.date), 'dd/MM/yyyy', { locale: ptBR })} por {item.user}
                    </p>
                    <p className="text-sm mt-1">{item.details}</p>
                  </div>
                ))}
              {filteredItems.filter(item => item.action === 'update').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma atualização encontrada
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="creations">
          <Card>
            <CardContent className="pt-6">
              {filteredItems
                .filter(item => item.action === 'create')
                .map(item => (
                  <div key={item.id} className="flex flex-col gap-1 border-b py-3 last:border-0">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.entityName || item.name}</h3>
                      <Badge>Criação</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.date), 'dd/MM/yyyy', { locale: ptBR })} por {item.user}
                    </p>
                    <p className="text-sm mt-1">{item.details}</p>
                  </div>
                ))}
              {filteredItems.filter(item => item.action === 'create').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma criação encontrada
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="archives">
          <Card>
            <CardContent className="pt-6">
              {filteredItems
                .filter(item => item.action === 'archive')
                .map(item => (
                  <div key={item.id} className="flex flex-col gap-1 border-b py-3 last:border-0">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.entityName || item.name}</h3>
                      <Badge variant="outline">Arquivamento</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.date), 'dd/MM/yyyy', { locale: ptBR })} por {item.user}
                    </p>
                    <p className="text-sm mt-1">{item.details}</p>
                  </div>
                ))}
              {filteredItems.filter(item => item.action === 'archive').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum arquivamento encontrado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Histórico</DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{selectedItem.entityName || selectedItem.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedItem.date), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Usuário</p>
                  <p>{selectedItem.user}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Ação</p>
                  <div className="mt-1">
                    {renderActionBadge(selectedItem.action)}
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Detalhes</p>
                <p className="mt-1">{selectedItem.details}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </BasePage>
  );
};

export default History;
