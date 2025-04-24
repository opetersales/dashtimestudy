
import React, { useState, useEffect } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loadFromLocalStorage, saveToLocalStorage, removeFromLocalStorage } from '@/services/localStorage';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Download } from 'lucide-react';

interface AppSettings {
  darkMode: boolean;
  companyName: string;
  companyLogo?: string;
  notificationsEnabled: boolean;
  autoSaveInterval: number; // in minutes
  dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
}

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    return loadFromLocalStorage<AppSettings>('appSettings', {
      darkMode: false,
      companyName: 'Minha Empresa',
      notificationsEnabled: true,
      autoSaveInterval: 5,
      dateFormat: 'dd/MM/yyyy',
    });
  });

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportData, setExportData] = useState('');
  const { toast } = useToast();

  // Effect to remove Lovable badge on component mount
  useEffect(() => {
    const badge = document.getElementById('lovable-badge');
    if (badge) {
      badge.style.display = 'none';
    }
  }, []);

  // Handle notifications
  useEffect(() => {
    if (settings.notificationsEnabled) {
      // Request notification permission if enabled
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, [settings.notificationsEnabled]);

  // Send notification function
  const sendNotification = (title: string, body: string) => {
    if (!settings.notificationsEnabled) return;
    
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body: body,
            icon: '/favicon.ico'
          });
        }
      });
    }
  };

  const handleSettingChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
    saveToLocalStorage('appSettings', updatedSettings);

    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    if (key === 'notificationsEnabled' && value === true) {
      Notification.requestPermission();
    }

    toast({
      title: "Configuração salva",
      description: "As configurações foram atualizadas com sucesso.",
    });
  };

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSettingChange('companyName', e.target.value);
  };

  const handleNumberChange = (key: keyof AppSettings, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      handleSettingChange(key as any, value as any);
    }
  };

  const handleExportAllData = () => {
    const exportObject: Record<string, any> = {};
    
    const keys = [
      'appSettings',
      'timeStudies',
      'gboData',
      'atividades',
      'gboList',
      'operatorsList',
      'planningEvents', 
      'documentsList',
      'history'
    ];
    
    keys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          exportObject[key] = JSON.parse(data);
        }
      } catch (error) {
        console.error(`Error exporting ${key}:`, error);
      }
    });
    
    const jsonString = JSON.stringify(exportObject, null, 2);
    setExportData(jsonString);
    setIsExportDialogOpen(true);
    
    // Send notification for export
    sendNotification('Dados Exportados', 'Seus dados foram exportados com sucesso.');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);
        
        Object.keys(jsonData).forEach(key => {
          saveToLocalStorage(key, jsonData[key]);
        });
        
        toast({
          title: "Dados importados",
          description: "Todos os dados foram importados com sucesso. A página será recarregada.",
        });
        
        // Send notification for import
        sendNotification('Dados Importados', 'Seus dados foram importados com sucesso.');
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "O arquivo selecionado não contém dados válidos.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllData = () => {
    const keys = [
      'appSettings',
      'timeStudies',
      'gboData',
      'atividades',
      'gboList',
      'operatorsList',
      'planningEvents',
      'documentsList',
      'history'
    ];
    
    keys.forEach(key => {
      removeFromLocalStorage(key);
    });
    
    toast({
      title: "Dados resetados",
      description: "Todos os dados foram resetados. A página será recarregada.",
    });
    
    setIsResetDialogOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const downloadExportFile = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `app_data_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Send notification for download
    sendNotification('Download Concluído', 'Seu arquivo de exportação foi baixado com sucesso.');
  };

  const handleOfflineDownload = () => {
    // Updated direct link to download
    const downloadUrl = "https://firebasestorage.googleapis.com/v0/b/flowline-insight.appspot.com/o/versao_offline.exe?alt=media";
    
    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'versao_offline.exe');
    
    // Append to the document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: "A versão offline será baixada. Note que esta versão funciona sem internet, mas não sincroniza com o banco de dados online.",
    });
    
    // Send notification for offline version download
    sendNotification('Download Iniciado', 'O download da versão offline foi iniciado.');
  };

  return (
    <BasePage title="Configurações">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações gerais</CardTitle>
              <CardDescription>Gerenciar as configurações básicas do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da empresa</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={handleCompanyNameChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificações</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações do sistema
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => handleSettingChange('notificationsEnabled', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="autoSaveInterval">Intervalo de salvamento automático (minutos)</Label>
                <Input
                  id="autoSaveInterval"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.autoSaveInterval}
                  onChange={(e) => handleNumberChange('autoSaveInterval', e)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalizar a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">Modo escuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Alterar para tema escuro
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Formato de data</Label>
                <select
                  id="dateFormat"
                  className="w-full rounded-md border border-input px-3 py-2 bg-background text-sm ring-offset-background"
                  value={settings.dateFormat}
                  onChange={(e) => handleSettingChange('dateFormat', e.target.value as any)}
                >
                  <option value="dd/MM/yyyy">DD/MM/AAAA</option>
                  <option value="MM/dd/yyyy">MM/DD/AAAA</option>
                  <option value="yyyy-MM-dd">AAAA-MM-DD</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de dados</CardTitle>
              <CardDescription>Exportar, importar ou resetar dados do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  Estas ações afetam todos os dados do sistema. Certifique-se de fazer backup antes de prosseguir.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleExportAllData}>
                  Exportar todos os dados
                </Button>
                
                <div className="flex items-center">
                  <input
                    type="file"
                    id="import-file"
                    accept=".json"
                    className="sr-only"
                    onChange={handleImportData}
                  />
                  <Label 
                    htmlFor="import-file"
                    className="flex-1 flex justify-center p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 cursor-pointer"
                  >
                    Importar dados
                  </Label>
                </div>
                
                <Button 
                  variant="destructive" 
                  onClick={() => setIsResetDialogOpen(true)}
                  className="col-span-1 md:col-span-2"
                >
                  Resetar todos os dados
                </Button>
              </div>
              
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-4">Versão Offline</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Baixe a versão offline do sistema para usar sem internet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Versão atual: 1.0.0
                    </p>
                  </div>
                  <Button 
                    onClick={handleOfflineDownload}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Baixar Versão Offline
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar todos os dados</DialogTitle>
            <DialogDescription>
              Esta ação irá apagar permanentemente todos os dados do sistema.
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleResetAllData}>
              Resetar dados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Exportar dados</DialogTitle>
            <DialogDescription>
              Seus dados foram exportados. Clique no botão abaixo para baixá-los.
            </DialogDescription>
          </DialogHeader>
          <div className="h-[300px] overflow-auto border rounded-md p-2 bg-muted/10">
            <pre className="text-xs">{exportData}</pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={downloadExportFile}>
              Baixar arquivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BasePage>
  );
};

export default Settings;
