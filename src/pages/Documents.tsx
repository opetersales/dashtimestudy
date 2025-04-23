
import React, { useState } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Search, Download, FileText, Filter } from 'lucide-react';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';

interface Document {
  id: string;
  title: string;
  type: 'gbo' | 'report' | 'manual' | 'other';
  createdAt: string;
  createdBy: string;
  description: string;
  size: string;
}

const Documents = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string | null>(null);

  // Função para obter o nome do usuário atual
  const getUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };
  
  // Carregar documentos fictícios
  const [documents] = useState<Document[]>(() => {
    const savedDocs = loadFromLocalStorage<Document[]>('documents', null);
    if (savedDocs) return savedDocs;
    
    // Gerar documentos de exemplo
    return [
      {
        id: 'doc-1',
        title: 'GBO Linha de Montagem Principal',
        type: 'gbo',
        createdAt: '2025-04-15T10:30:00Z',
        createdBy: 'Carlos Silva',
        description: 'Documento GBO para linha de montagem principal',
        size: '2.4 MB'
      },
      {
        id: 'doc-2',
        title: 'Manual de Operação - Estação 3',
        type: 'manual',
        createdAt: '2025-04-16T14:15:00Z',
        createdBy: 'Ana Paula',
        description: 'Manual de instruções para operadores da estação 3',
        size: '4.1 MB'
      },
      {
        id: 'doc-3',
        title: 'Relatório de Eficiência Mensal',
        type: 'report',
        createdAt: '2025-04-17T09:45:00Z',
        createdBy: 'João Martins',
        description: 'Relatório consolidado de eficiência da produção - Abril 2025',
        size: '1.8 MB'
      },
      {
        id: 'doc-4',
        title: 'GBO Linha de Embalagem',
        type: 'gbo',
        createdAt: '2025-04-18T16:20:00Z',
        createdBy: 'Carlos Silva',
        description: 'Documento GBO para linha de embalagem',
        size: '2.1 MB'
      },
      {
        id: 'doc-5',
        title: 'Procedimento de Manutenção',
        type: 'other',
        createdAt: '2025-04-19T11:10:00Z',
        createdBy: 'Roberta Almeida',
        description: 'Procedimento padrão para manutenção preventiva de equipamentos',
        size: '3.7 MB'
      }
    ];
  });
  
  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === null || doc.type === filterType;
    
    return matchesSearch && matchesFilter;
  });
  
  // Manipular seleção de documentos
  const toggleDocumentSelection = (id: string) => {
    setSelectedDocuments(prev => 
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };
  
  // Selecionar/deselecionar todos os documentos
  const toggleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };
  
  // Exportar documentos selecionados
  const handleExportDocuments = () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "Nenhum documento selecionado",
        description: "Por favor, selecione pelo menos um documento para exportar.",
        variant: "destructive",
      });
      return;
    }
    
    // Obter documentos selecionados
    const docsToExport = documents.filter(doc => selectedDocuments.includes(doc.id));
    
    // Criar planilha de exportação
    const data = docsToExport.map(doc => ({
      Título: doc.title,
      Tipo: doc.type === 'gbo' ? 'GBO' : 
            doc.type === 'report' ? 'Relatório' :
            doc.type === 'manual' ? 'Manual' : 'Outro',
      'Data de Criação': format(new Date(doc.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      Autor: doc.createdBy,
      Descrição: doc.description,
      Tamanho: doc.size
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Documentos Exportados');
    
    // Exportar como arquivo Excel
    XLSX.writeFile(wb, `documentos_exportados_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast({
      title: "Documentos exportados",
      description: `${selectedDocuments.length} documentos foram exportados com sucesso.`,
    });
    
    // Registrar no histórico
    updateHistory('Exportação de documentos', `${selectedDocuments.length} documentos foram exportados`);
  };
  
  // Função para registrar histórico
  const updateHistory = (action: string, details: string) => {
    const history = loadFromLocalStorage<any[]>('history', []);
    const newHistoryItem = {
      id: `hist-${Date.now()}`,
      name: 'Documentos',
      version: '1.0',
      date: new Date().toISOString(),
      user: getUserName(),
      action: 'update',
      details,
    };
    history.unshift(newHistoryItem);
    saveToLocalStorage('history', history);
  };
  
  // Renderizar a interface
  return (
    <BasePage title="Documentos">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-6">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar documentos..." 
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
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterType(null)}>
                Todos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('gbo')}>
                GBOs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('report')}>
                Relatórios
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('manual')}>
                Manuais
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterType('other')}>
                Outros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          disabled={selectedDocuments.length === 0}
          onClick={handleExportDocuments}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar Selecionados
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Documentos Disponíveis</CardTitle>
            <Checkbox 
              checked={filteredDocuments.length > 0 && selectedDocuments.length === filteredDocuments.length}
              onCheckedChange={toggleSelectAll}
              aria-label="Selecionar todos"
            />
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="w-12 text-center font-medium py-2">&nbsp;</th>
                <th className="text-left font-medium py-2">Documento</th>
                <th className="text-left font-medium py-2 hidden md:table-cell">Tipo</th>
                <th className="text-left font-medium py-2 hidden md:table-cell">Data</th>
                <th className="text-left font-medium py-2 hidden md:table-cell">Autor</th>
                <th className="text-left font-medium py-2 hidden lg:table-cell">Tamanho</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 text-center">
                      <Checkbox 
                        checked={selectedDocuments.includes(doc.id)} 
                        onCheckedChange={() => toggleDocumentSelection(doc.id)} 
                        aria-label={`Selecionar ${doc.title}`}
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-muted-foreground md:hidden">{doc.type === 'gbo' ? 'GBO' : 
                            doc.type === 'report' ? 'Relatório' :
                            doc.type === 'manual' ? 'Manual' : 'Outro'} • {format(new Date(doc.createdAt), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      {doc.type === 'gbo' ? 'GBO' : 
                       doc.type === 'report' ? 'Relatório' :
                       doc.type === 'manual' ? 'Manual' : 'Outro'}
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      {format(new Date(doc.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="py-3 hidden md:table-cell">{doc.createdBy}</td>
                    <td className="py-3 hidden lg:table-cell">{doc.size}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhum documento encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <p className="text-sm text-muted-foreground">
              {selectedDocuments.length} de {filteredDocuments.length} documento(s) selecionado(s)
            </p>
            <Button 
              variant="outline"
              size="sm"
              disabled={selectedDocuments.length === 0}
              onClick={handleExportDocuments}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardFooter>
      </Card>
    </BasePage>
  );
};

export default Documents;
