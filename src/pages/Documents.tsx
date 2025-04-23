import React, { useState } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useToast } from '@/components/ui/use-toast';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Download, Trash2, File, FileText, Pencil } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Document {
  id: string;
  title: string;
  type: 'manual' | 'procedure' | 'instruction' | 'report' | 'spec';
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  status: 'draft' | 'published' | 'archived' | 'review';
  content?: string;
  relatedTo?: string;
  tags?: string[];
}

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<Document | null>(null);
  const [documentToView, setDocumentToView] = useState<Document | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const [documents, setDocuments] = useState<Document[]>(() => {
    const savedDocuments = loadFromLocalStorage<Document[]>('documentsList', []);
    if (savedDocuments.length === 0) {
      const today = new Date();
      const mockDocuments: Document[] = [
        {
          id: 'doc-1',
          title: 'Manual de Operação - Linha 01',
          type: 'manual',
          description: 'Manual detalhado para operação da linha de produção 01',
          createdBy: 'Carlos Silva',
          createdAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          version: '1.2',
          status: 'published',
          content: 'Este documento contém todas as instruções necessárias para a operação da linha de produção 01.',
          tags: ['linha-01', 'operação', 'manual']
        },
        {
          id: 'doc-2',
          title: 'Procedimento de Segurança',
          type: 'procedure',
          description: 'Procedimentos de segurança para todas as linhas de produção',
          createdBy: 'Maria Oliveira',
          createdAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          version: '2.1',
          status: 'published',
          content: 'Este documento detalha todos os procedimentos de segurança que devem ser seguidos pelos operadores.',
          tags: ['segurança', 'procedimento', 'obrigatório']
        },
        {
          id: 'doc-3',
          title: 'Relatório de Performance - Q1',
          type: 'report',
          description: 'Relatório de performance do primeiro trimestre',
          createdBy: 'João Santos',
          createdAt: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          version: '1.0',
          status: 'archived',
          content: 'Relatório detalhando a performance operacional do primeiro trimestre.',
          tags: ['relatório', 'Q1', 'performance']
        },
        {
          id: 'doc-4',
          title: 'Instrução de Trabalho - Linha 02',
          type: 'instruction',
          description: 'Instruções de trabalho específicas para linha 02',
          createdBy: 'Ana Costa',
          createdAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          version: '1.1',
          status: 'review',
          content: 'Instruções detalhadas para operações na linha 02.',
          relatedTo: 'GBO Linha 02',
          tags: ['linha-02', 'instrução', 'operação']
        }
      ];
      saveToLocalStorage('documentsList', mockDocuments);
      return mockDocuments;
    }
    return savedDocuments;
  });

  const filteredDocuments = documents.filter(doc => 
    searchQuery === '' || 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );
  
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const type = formData.get('type') as Document['type'];
    const description = formData.get('description') as string;
    const content = formData.get('content') as string;
    const relatedTo = formData.get('relatedTo') as string;
    const status = formData.get('status') as Document['status'];
    
    const tagsInput = formData.get('tags') as string;
    const tags = tagsInput ? 
      tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '') :
      [];
    
    if (documentToEdit) {
      const updatedDocuments = documents.map(doc => 
        doc.id === documentToEdit.id 
          ? {
              ...documentToEdit,
              title,
              type,
              description,
              content,
              relatedTo,
              updatedAt: new Date().toISOString(),
              status,
              tags
            }
          : doc
      );
      
      setDocuments(updatedDocuments);
      saveToLocalStorage('documentsList', updatedDocuments);
      
      toast({
        title: "Documento atualizado",
        description: "O documento foi atualizado com sucesso.",
      });
    } else {
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        title,
        type,
        description,
        content,
        relatedTo,
        createdBy: "Admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: "1.0",
        status,
        tags
      };
      
      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);
      saveToLocalStorage('documentsList', updatedDocuments);
      
      toast({
        title: "Documento criado",
        description: "O novo documento foi criado com sucesso.",
      });
    }
    
    setIsFormOpen(false);
    setDocumentToEdit(null);
  };
  
  const handleEditDocument = (doc: Document) => {
    setDocumentToEdit(doc);
    setIsFormOpen(true);
  };
  
  const handleViewDocument = (doc: Document) => {
    setDocumentToView(doc);
    setIsViewOpen(true);
  };
  
  const confirmDeleteDocument = (id: string) => {
    setDocumentToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteDocument = () => {
    if (documentToDelete) {
      const updatedDocuments = documents.filter(doc => doc.id !== documentToDelete);
      setDocuments(updatedDocuments);
      saveToLocalStorage('documentsList', updatedDocuments);
      
      toast({
        title: "Documento removido",
        description: "O documento foi removido com sucesso.",
      });
      
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };
  
  const handleExportToExcel = () => {
    const data = documents.map(doc => ({
      Título: doc.title,
      Tipo: doc.type === 'manual' ? 'Manual' :
            doc.type === 'procedure' ? 'Procedimento' :
            doc.type === 'instruction' ? 'Instrução' :
            doc.type === 'report' ? 'Relatório' : 'Especificação',
      Descrição: doc.description,
      'Criado por': doc.createdBy,
      'Data de Criação': format(new Date(doc.createdAt), 'dd/MM/yyyy', { locale: ptBR }),
      'Última Atualização': format(new Date(doc.updatedAt), 'dd/MM/yyyy', { locale: ptBR }),
      Versão: doc.version,
      Status: doc.status === 'draft' ? 'Rascunho' :
              doc.status === 'published' ? 'Publicado' :
              doc.status === 'archived' ? 'Arquivado' : 'Em Revisão',
      'Relacionado a': doc.relatedTo || 'N/A',
      Tags: doc.tags ? doc.tags.join(', ') : 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    
    const wscols = [
      { wch: 30 },
      { wch: 15 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
    ];
    ws['!cols'] = wscols;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Documentos');
    
    XLSX.writeFile(wb, 'documentos.xlsx');
  };
  
  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'manual': return 'Manual';
      case 'procedure': return 'Procedimento';
      case 'instruction': return 'Instrução';
      case 'report': return 'Relatório';
      case 'spec': return 'Especificação';
      default: return type;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      case 'published':
        return <Badge>Publicado</Badge>;
      case 'archived':
        return <Badge variant="secondary">Arquivado</Badge>;
      case 'review':
        return <Badge variant="destructive">Em Revisão</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'manual': 
        return <FileText className="h-5 w-5" />;
      case 'procedure': 
        return <File className="h-5 w-5" />;
      case 'instruction': 
        return <FileText className="h-5 w-5" />;
      case 'report': 
        return <FileText className="h-5 w-5" />;
      case 'spec': 
        return <File className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const addNewDocument = () => {
    setDocumentToEdit(null);
    setIsFormOpen(true);
  };

  return (
    <BasePage title="Documentos">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar documentos..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          
          <Button onClick={addNewDocument}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Documento
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Documentação do Sistema</CardTitle>
          <CardDescription>Gerenciamento de manuais, procedimentos, instruções e relatórios</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">Descrição</TableHead>
                    <TableHead className="hidden lg:table-cell">Criado em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getDocumentIcon(doc.type)}
                          <span className="ml-2">{doc.title}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">v{doc.version}</div>
                      </TableCell>
                      <TableCell>{getTypeDisplayName(doc.type)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="max-w-[200px] lg:max-w-[300px] truncate" title={doc.description}>
                          {doc.description}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {format(new Date(doc.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewDocument(doc)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditDocument(doc)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => confirmDeleteDocument(doc.id)}
                            className="text-destructive"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery 
                ? "Nenhum documento encontrado para a busca realizada" 
                : "Nenhum documento cadastrado. Clique no botão 'Novo Documento' para começar."
              }
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{documentToEdit ? 'Editar Documento' : 'Novo Documento'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title" 
                name="title" 
                defaultValue={documentToEdit?.title || ''} 
                placeholder="Título do documento"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select 
                  name="type" 
                  defaultValue={documentToEdit?.type || 'manual'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="procedure">Procedimento</SelectItem>
                    <SelectItem value="instruction">Instrução</SelectItem>
                    <SelectItem value="report">Relatório</SelectItem>
                    <SelectItem value="spec">Especificação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  name="status" 
                  defaultValue={documentToEdit?.status || 'draft'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={documentToEdit?.description || ''} 
                placeholder="Descrição do documento"
                required
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea 
                id="content" 
                name="content" 
                defaultValue={documentToEdit?.content || ''} 
                placeholder="Conteúdo do documento"
                rows={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relatedTo">Relacionado a</Label>
              <Input 
                id="relatedTo" 
                name="relatedTo" 
                defaultValue={documentToEdit?.relatedTo || ''} 
                placeholder="GBO ou processo relacionado"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input 
                id="tags" 
                name="tags" 
                defaultValue={documentToEdit?.tags?.join(', ') || ''} 
                placeholder="Ex: linha-01, manual, operação"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {documentToEdit ? 'Salvar alterações' : 'Criar documento'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {documentToView && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getDocumentIcon(documentToView.type)}
                    <span className="ml-2">{documentToView.title}</span>
                  </div>
                  {getStatusBadge(documentToView.status)}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {documentToView && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
                <p>{getTypeDisplayName(documentToView.type)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
                <p>{documentToView.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Conteúdo</h3>
                <div className="p-4 border rounded-md bg-muted/10 whitespace-pre-wrap">
                  {documentToView.content || 'Sem conteúdo'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Autor</h3>
                  <p>{documentToView.createdBy}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Versão</h3>
                  <p>{documentToView.version}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Criado em</h3>
                  <p>{format(new Date(documentToView.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Atualizado em</h3>
                  <p>{format(new Date(documentToView.updatedAt), 'dd/MM/yyyy', { locale: ptBR })}</p>
                </div>
              </div>
              
              {documentToView.relatedTo && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Relacionado a</h3>
                  <p>{documentToView.relatedTo}</p>
                </div>
              )}
              
              {documentToView.tags && documentToView.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {documentToView.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => handleEditDocument(documentToView)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button onClick={() => setIsViewOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDocument}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BasePage>
  );
};

export default Documents;
