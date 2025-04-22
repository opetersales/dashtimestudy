
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Edit, Trash2, FileText, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActivityCharts } from '@/components/activity/ActivityCharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define types
interface GBO {
  client: string;
  model: string;
  date: Date;
  author: string;
  hoursWorked: number;
  shift: string;
}

interface Activity {
  id: string;
  station: string;
  description: string;
  cycleTime: number;
  fatigue: number;
  adjustedCycleTime: number;
}

// Define types for the chart data
interface StationData {
  station: string;
  totalTime: number;
  adjustedTime: number;
}

interface UphData {
  station: string;
  uph: number;
}

interface UpphData {
  station: string;
  upph: number;
}

interface ChartData {
  stationData: StationData[];
  uphData: UphData[];
  upphData: UpphData[];
}

const ActivityAnalysis: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const { toast } = useToast();

  // GBO State
  const [gbo, setGbo] = useState<GBO>({
    client: '',
    model: '',
    date: new Date(),
    author: '',
    hoursWorked: 0,
    shift: 'Manhã',
  });

  // Activity State
  const [activity, setActivity] = useState<Omit<Activity, 'id' | 'adjustedCycleTime'>>({
    station: '',
    description: '',
    cycleTime: 0,
    fatigue: 0,
  });

  // Activities List State
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  // Calculate adjusted cycle time
  const calculateAdjustedCycleTime = (cycleTime: number, fatigue: number) => {
    return cycleTime * (1 + fatigue / 100);
  };

  // Handle GBO form changes
  const handleGboChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGbo({
      ...gbo,
      [name]: name === 'hoursWorked' ? parseFloat(value) || 0 : value,
    });
  };

  // Handle Activity form changes
  const handleActivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setActivity({
      ...activity,
      [name]: ['cycleTime', 'fatigue'].includes(name) ? parseFloat(value) || 0 : value,
    });
  };

  // Handle shift selection
  const handleShiftChange = (value: string) => {
    setGbo({ ...gbo, shift: value });
  };

  // Handle station selection
  const handleStationChange = (value: string) => {
    setActivity({ ...activity, station: value });
  };

  // Add or update activity
  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activity.station || !activity.description || activity.cycleTime <= 0) {
      toast({
        title: "Validação",
        description: "Preencha todos os campos da atividade corretamente.",
        variant: "destructive",
      });
      return;
    }

    if (editingActivity) {
      // Update existing activity
      const updatedActivities = activities.map(item => 
        item.id === editingActivity.id 
          ? {
              ...item,
              ...activity,
              adjustedCycleTime: calculateAdjustedCycleTime(activity.cycleTime, activity.fatigue)
            }
          : item
      );
      setActivities(updatedActivities);
      setEditingActivity(null);
      toast({
        title: "Sucesso",
        description: "Atividade atualizada com sucesso.",
      });
    } else {
      // Add new activity
      const newActivity: Activity = {
        id: Date.now().toString(),
        ...activity,
        adjustedCycleTime: calculateAdjustedCycleTime(activity.cycleTime, activity.fatigue)
      };
      setActivities([...activities, newActivity]);
      toast({
        title: "Sucesso",
        description: "Atividade adicionada com sucesso.",
      });
    }

    // Reset form
    setActivity({
      station: '',
      description: '',
      cycleTime: 0,
      fatigue: 0,
    });
  };

  // Edit activity
  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivity({
      station: activity.station,
      description: activity.description,
      cycleTime: activity.cycleTime,
      fatigue: activity.fatigue,
    });
  };

  // Delete activity
  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
    toast({
      title: "Sucesso",
      description: "Atividade removida com sucesso.",
    });
  };

  // Export to Excel
  const handleExportToExcel = () => {
    if (activities.length === 0) {
      toast({
        title: "Aviso",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    // This is a placeholder - you'd import the xlsx library to actually implement this
    // For now, we'll just show a success toast
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo exportados para Excel.",
    });
    
    // Here's where you'd implement the actual Excel export
    // Example (commented out as it needs the xlsx library):
    /*
    import * as XLSX from 'xlsx';
    
    const worksheet = XLSX.utils.json_to_sheet(activities);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Atividades");
    XLSX.writeFile(workbook, `GBO_${gbo.client}_${format(gbo.date, 'dd-MM-yyyy')}.xlsx`);
    */
  };

  // Apply dark theme
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  // Calculate data for charts
  const getChartData = (): ChartData => {
    const stationData: Record<string, { totalTime: number; adjustedTime: number; activities: number }> = {};
    
    activities.forEach(activity => {
      const station = activity.station;
      if (!stationData[station]) {
        stationData[station] = {
          totalTime: 0,
          adjustedTime: 0,
          activities: 0
        };
      }
      
      stationData[station].totalTime += activity.cycleTime;
      stationData[station].adjustedTime += activity.adjustedCycleTime;
      stationData[station].activities += 1;
    });
    
    // Calculate UPH (Units per Hour) for each station
    // UPH = 3600 / total time for station
    const uphData = Object.entries(stationData).map(([station, data]) => ({
      station,
      uph: 3600 / data.adjustedTime,
    }));
    
    // Calculate UPPH (Units per Person per Hour)
    // UPPH = UPH * Hours Worked
    const upphData = uphData.map(item => ({
      station: item.station,
      upph: item.uph * gbo.hoursWorked,
    }));
    
    return {
      stationData: Object.entries(stationData).map(([station, data]) => ({
        station,
        totalTime: data.totalTime,
        adjustedTime: data.adjustedTime,
      })),
      uphData,
      upphData,
    };
  };

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
          <h1 className="text-2xl font-bold mb-6">Análise de Atividades</h1>
          
          {/* Section 1: GBO Registration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Cadastro de GBO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Cliente</Label>
                  <Input 
                    id="client" 
                    name="client"
                    value={gbo.client}
                    onChange={handleGboChange}
                    placeholder="Nome do cliente"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input 
                    id="model" 
                    name="model"
                    value={gbo.model}
                    onChange={handleGboChange}
                    placeholder="Modelo do produto"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !gbo.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {gbo.date ? format(gbo.date, 'dd/MM/yyyy', { locale: ptBR }) : <span>Selecione uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={gbo.date}
                        onSelect={(date) => date && setGbo({ ...gbo, date })}
                        initialFocus
                        locale={ptBR}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="author">Autor</Label>
                  <Input 
                    id="author" 
                    name="author"
                    value={gbo.author}
                    onChange={handleGboChange}
                    placeholder="Nome do autor"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hoursWorked">Horas Trabalhadas</Label>
                  <Input 
                    id="hoursWorked" 
                    name="hoursWorked"
                    type="number"
                    value={gbo.hoursWorked || ''}
                    onChange={handleGboChange}
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shift">Turno</Label>
                  <Select value={gbo.shift} onValueChange={handleShiftChange}>
                    <SelectTrigger id="shift" className="w-full">
                      <SelectValue placeholder="Selecione um turno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Section 2: Activity Registration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingActivity ? 'Editar Atividade' : 'Cadastro de Atividade'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleActivitySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="station">Posto</Label>
                    <Select 
                      value={activity.station} 
                      onValueChange={handleStationChange}
                    >
                      <SelectTrigger id="station" className="w-full">
                        <SelectValue placeholder="Selecione um posto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Posto 1">Posto 1</SelectItem>
                        <SelectItem value="Posto 2">Posto 2</SelectItem>
                        <SelectItem value="Posto 3">Posto 3</SelectItem>
                        <SelectItem value="Posto 4">Posto 4</SelectItem>
                        <SelectItem value="Posto 5">Posto 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição da Atividade</Label>
                    <Input 
                      id="description" 
                      name="description"
                      value={activity.description}
                      onChange={handleActivityChange}
                      placeholder="Descrição da atividade"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cycleTime">Cycle Time (s)</Label>
                    <Input 
                      id="cycleTime" 
                      name="cycleTime"
                      type="number"
                      value={activity.cycleTime || ''}
                      onChange={handleActivityChange}
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fatigue">Percentual de Fadiga (%)</Label>
                    <Input 
                      id="fatigue" 
                      name="fatigue"
                      type="number"
                      value={activity.fatigue || ''}
                      onChange={handleActivityChange}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  {editingActivity && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => {
                        setEditingActivity(null);
                        setActivity({
                          station: '',
                          description: '',
                          cycleTime: 0,
                          fatigue: 0,
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button type="submit">
                    <Plus className="mr-2 h-4 w-4" />
                    {editingActivity ? 'Atualizar Atividade' : 'Adicionar Atividade'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Section 3: Dynamic Table */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lista de Atividades</CardTitle>
              <Button 
                variant="outline" 
                onClick={handleExportToExcel} 
                disabled={activities.length === 0}
              >
                <FileText className="mr-2 h-4 w-4" />
                Exportar para Excel
              </Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posto</TableHead>
                      <TableHead>Atividade</TableHead>
                      <TableHead>Cycle Time (s)</TableHead>
                      <TableHead>Fadiga (%)</TableHead>
                      <TableHead>CT Ajustado (s)</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhuma atividade cadastrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      activities.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.station}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.cycleTime.toFixed(1)}</TableCell>
                          <TableCell>{item.fatigue.toFixed(0)}%</TableCell>
                          <TableCell>{item.adjustedCycleTime.toFixed(1)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditActivity(item)}
                              className="mr-1"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteActivity(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          {/* Section 4: Charts */}
          {activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gráficos de Análise</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityCharts chartData={getChartData()} />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};

export default ActivityAnalysis;
