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
import { 
  Dialog,
  DialogContent,
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Search, Download, Upload, FileText, Filter, Trash } from 'lucide-react';
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
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importTitle, setImportTitle] = useState('');
  const [importType, setImportType] = useState<'gbo' | 'report' | 'manual' | 'other'>('report');
  const [importDescription, setImportDescription] = useState('');
  const [fileData, setFileData] = useState<File | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  // Função para obter o nome do usuário atual
  const getUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };
  
  // Carregar documentos
  const [documents, setDocuments] = useState<Document[]>(() => {
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

  // Importar documento
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileData(e.target.files[0]);
    }
  };

  const handleImportDocument = () => {
    if (!fileData) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para importar.",
        variant: "destructive",
      });
      return;
    }

    if (!importTitle) {
      toast({
        title: "Título não informado",
        description: "Por favor, informe um título para o documento.",
        variant: "destructive",
      });
      return;
    }

    // Criar novo documento
    const newDocument: Document = {
      id: `doc-${Date.now()}`,
      title: importTitle,
      type: importType,
      createdAt: new Date().toISOString(),
      createdBy: getUserName(),
      description: importDescription || `Documento importado em ${format(new Date(), 'dd/MM/yyyy')}`,
      size: `${(fileData.size / (1024 * 1024)).toFixed(1)} MB`
    };

    // Adicionar à lista de documentos
    const updatedDocuments = [...documents, newDocument];
    setDocuments(updatedDocuments);
    saveToLocalStorage('documents', updatedDocuments);
    
    setIsImportDialogOpen(false);
    setImportTitle('');
    setImportType('report');
    setImportDescription('');
    setFileData(null);
    
    toast({
      title: "Documento importado",
      description: `O documento ${importTitle} foi importado com sucesso.`,
    });
    
    // Registrar no histórico
    updateHistory('Importação de documento', `O documento ${importTitle} foi importado`);
  };
  
  // Função para deletar documento
  const handleDeleteDocument = (e: React.MouseEvent, doc: Document) => {
    e.preventDefault();
    e.stopPropagation();
    setDocumentToDelete(doc);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDocument = () => {
    if (!documentToDelete) return;
    
    const updatedDocuments = documents.filter(doc => doc.id !== documentToDelete.id);
    setDocuments(updatedDocuments);
    saveToLocalStorage('documents', updatedDocuments);
    
    toast({
      title: "Documento excluído",
      description: `O documento ${documentToDelete.title} foi excluído com sucesso.`,
    });
    
    // Registrar no histórico
    updateHistory('Exclusão de documento', `O documento ${documentToDelete.title} foi excluído`);
    
    setIsDeleteDialogOpen(false);
    setDocumentToDelete(null);
    
    // Caso o documento excluído esteja selecionado, remova-o da seleção
    if (selectedDocuments.includes(documentToDelete.id)) {
      setSelectedDocuments(selectedDocuments.filter(id => id !== documentToDelete.id));
    }
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
        <div className="flex gap-2">
          <Button onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Importar Documento
          </Button>
          <Button
            disabled={selectedDocuments.length === 0}
            onClick={handleExportDocuments}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Selecionados
          </Button>
        </div>
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
                <th className="text-right font-medium py-2">Ações</th>
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
                    <td className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteDocument(e, doc)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
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
      
      {/* Diálogo para importar documento */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importar Documento</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para importar um novo documento.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="title"
                value={importTitle}
                onChange={(e) => setImportTitle(e.target.value)}
                placeholder="Título do documento"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="type" className="text-sm font-medium">
                Tipo
              </label>
              <select 
                id="type"
                value={importType}
                onChange={(e) => setImportType(e.target.value as any)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="gbo">GBO</option>
                <option value="report">Relatório</option>
                <option value="manual">Manual</option>
                <option value="other">Outro</option>
              </select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição (opcional)
              </label>
              <Input
                id="description"
                value={importDescription}
                onChange={(e) => setImportDescription(e.target.value)}
                placeholder="Descrição do documento"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="file" className="text-sm font-medium">
                Arquivo
              </label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleImportDocument}>
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para confirmar exclusão de documento */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Este documento será excluído permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>
              Tem certeza que deseja excluir o documento &quot;{documentToDelete?.title}&quot;?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteDocument}>
              Excluir Documento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BasePage>
  );
};

export default Documents;
