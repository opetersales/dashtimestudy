
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, Upload, FileText, Image, FileVideo, Download, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Documents = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isDarkTheme, setIsDarkTheme] = React.useState(false);

  // Apply dark theme class to the html element
  React.useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const documents = [
    { id: 1, name: 'Instruções Linha 01', type: 'text', size: '1.2 MB', date: '2025-04-19', gbo: 'GBO Linha 01' },
    { id: 2, name: 'Foto Posto 3', type: 'image', size: '4.5 MB', date: '2025-04-18', gbo: 'GBO Linha 02' },
    { id: 3, name: 'Tutorial Montagem', type: 'video', size: '15.7 MB', date: '2025-04-17', gbo: 'GBO Linha 01' },
    { id: 4, name: 'Checklist Qualidade', type: 'text', size: '0.5 MB', date: '2025-04-16', gbo: 'GBO Linha 03' },
    { id: 5, name: 'Procedimento Padrão', type: 'text', size: '2.1 MB', date: '2025-04-15', gbo: 'GBO Linha 01' },
    { id: 6, name: 'Diagrama Fluxo', type: 'image', size: '1.8 MB', date: '2025-04-14', gbo: 'GBO Linha 02' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header 
          sidebarCollapsed={sidebarCollapsed} 
          onToggleTheme={toggleTheme} 
          isDarkTheme={isDarkTheme} 
        />
        
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold">Documentos</h1>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar documento..." className="pl-8" />
              </div>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="instructions">Instruções</TabsTrigger>
              <TabsTrigger value="media">Mídia</TabsTrigger>
              <TabsTrigger value="checklists">Checklists</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map(doc => (
                  <Card key={doc.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-medium">{doc.name}</CardTitle>
                        {doc.type === 'text' && <FileText className="h-5 w-5 text-blue-500" />}
                        {doc.type === 'image' && <Image className="h-5 w-5 text-green-500" />}
                        {doc.type === 'video' && <FileVideo className="h-5 w-5 text-red-500" />}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {new Date(doc.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-1">Tamanho: {doc.size}</p>
                      <p className="text-sm">Relacionado a: {doc.gbo}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
                <Card className="flex items-center justify-center bg-muted/30 border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="flex flex-col items-center justify-center py-6">
                    <div className="rounded-full bg-background p-2 mb-2">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-center text-muted-foreground">Adicionar documento</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="instructions">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documents
                  .filter(doc => doc.type === 'text')
                  .map(doc => (
                    <Card key={doc.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-medium">{doc.name}</CardTitle>
                          <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {new Date(doc.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-1">Tamanho: {doc.size}</p>
                        <Badge className="mt-2">{doc.gbo}</Badge>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="media">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documents
                  .filter(doc => doc.type === 'image' || doc.type === 'video')
                  .map(doc => (
                    <Card key={doc.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-medium">{doc.name}</CardTitle>
                          {doc.type === 'image' && <Image className="h-5 w-5 text-green-500" />}
                          {doc.type === 'video' && <FileVideo className="h-5 w-5 text-red-500" />}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                          {doc.type === 'image' && <Image className="h-10 w-10 text-muted-foreground" />}
                          {doc.type === 'video' && <FileVideo className="h-10 w-10 text-muted-foreground" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {new Date(doc.date).toLocaleDateString()}
                        </p>
                        <Badge className="mt-2">{doc.gbo}</Badge>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="checklists">
              <div className="grid grid-cols-1 gap-4">
                {documents
                  .filter(doc => doc.name.toLowerCase().includes('checklist'))
                  .map(doc => (
                    <Card key={doc.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-medium">{doc.name}</CardTitle>
                          <FileText className="h-5 w-5 text-blue-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {new Date(doc.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-1">Tamanho: {doc.size}</p>
                        <Badge className="mt-2">{doc.gbo}</Badge>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Documents;
