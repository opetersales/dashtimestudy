import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BasePage } from '@/components/layout/BasePage';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Plus, Trash, File, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TimeStudyForm } from '@/components/timeStudy/TimeStudyForm';
import { 
  ProductionLineForm, 
  WorkstationForm, 
  ActivityForm, 
  ShiftForm 
} from '@/components/timeStudy/forms';
import { TimeStudy, ProductionLine, Workstation, Activity, Shift } from '@/utils/types';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

const TimeStudyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [study, setStudy] = useState<TimeStudy | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLineFormOpen, setIsLineFormOpen] = useState(false);
  const [isWorkstationFormOpen, setIsWorkstationFormOpen] = useState(false);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [isShiftFormOpen, setIsShiftFormOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState<ProductionLine | null>(null);
  const [selectedWorkstation, setSelectedWorkstation] = useState<Workstation | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (id) {
      const storedStudies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
      const foundStudy = storedStudies.find(s => s.id === id);
      if (foundStudy) {
        setStudy(foundStudy);
      } else {
        toast({
          title: "Estudo não encontrado",
          description: "O estudo especificado não foi encontrado.",
        });
        navigate('/time-studies');
      }
    }
  }, [id, navigate, toast]);

  const getUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };

  const updateHistory = (action: string, details: string, studyName: string) => {
    const history = loadFromLocalStorage<any[]>('history', []);
    const newHistoryItem = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString(),
      user: getUserName(),
      action: action,
      details: details,
      entityType: 'timeStudy',
      entityId: study?.id || 'unknown',
      entityName: studyName,
    };
    history.unshift(newHistoryItem);
    saveToLocalStorage('history', history);
  };

  const handleSaveStudy = (updatedData: Partial<TimeStudy> = {}, newStatus?: 'draft' | 'active' | 'archived') => {
    if (!study) return;

    const updatedStudy = {
      ...study,
      ...updatedData,
      updatedAt: new Date().toISOString(),
      status: newStatus || study.status
    };

    // Update study in localStorage
    const allStudies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
    const updatedStudies = allStudies.map(s => s.id === study.id ? updatedStudy : s);
    saveToLocalStorage('timeStudies', updatedStudies);

    // Update local state
    setStudy(updatedStudy as TimeStudy);

    // Record history
    updateHistory(
      'edit',
      `Edição do estudo ${updatedStudy.client} - ${updatedStudy.modelName}`,
      `${updatedStudy.client} - ${updatedStudy.modelName}`
    );
    
    toast({
      title: "Estudo atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
    
    // Trigger dashboard update
    window.dispatchEvent(new Event('dashboardUpdate'));
  };

  const handleDeleteStudy = () => {
    if (!study) return;
    
    const allStudies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
    const updatedStudies = allStudies.filter(s => s.id !== study.id);
    saveToLocalStorage('timeStudies', updatedStudies);
    
    updateHistory(
      'delete',
      `Exclusão do estudo ${study.client} - ${study.modelName}`,
      `${study.client} - ${study.modelName}`
    );
    
    toast({
      title: "Estudo excluído",
      description: `${study.client} - ${study.modelName} foi excluído com sucesso.`,
    });
    
    setIsDeleteDialogOpen(false);
    navigate('/time-studies');
    
    // Trigger dashboard update
    window.dispatchEvent(new Event('dashboardUpdate'));
  };

  const handleExportStudy = () => {
    if (!study) return;
    setIsExporting(true);
    
    // Create a blob with the study data
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
    
    setIsExporting(false);
  };

  // Production Lines
  const handleNewLineSubmit = (data: ProductionLine) => {
    if (!study) return;
    
    const newLine: ProductionLine = {
      id: `line-${Date.now()}`,
      name: data.name,
      notes: data.notes,
      workstations: [],
    };
    
    const updatedStudy: TimeStudy = {
      ...study,
      productionLines: [...study.productionLines, newLine],
      updatedAt: new Date().toISOString(),
    };
    
    handleSaveStudy({ productionLines: updatedStudy.productionLines });
    setIsLineFormOpen(false);
  };

  const handleUpdateLine = (updatedLine: ProductionLine) => {
    if (!study) return;
  
    const updatedLines = study.productionLines.map(line =>
      line.id === updatedLine.id ? { ...line, ...updatedLine } : line
    );
  
    handleSaveStudy({ productionLines: updatedLines });
    setSelectedLine(null);
  };

  const handleDeleteLine = (lineToDelete: ProductionLine) => {
    if (!study) return;
  
    const updatedLines = study.productionLines.filter(line => line.id !== lineToDelete.id);
    handleSaveStudy({ productionLines: updatedLines });
    setSelectedLine(null);
  };

  // Workstations
  const handleNewWorkstationSubmit = (data: Workstation) => {
    if (!study || !selectedLine) return;
    
    const newWorkstation: Workstation = {
      id: `ws-${Date.now()}`,
      number: data.number,
      name: data.name,
      notes: data.notes,
      activities: [],
    };
    
    const updatedLines = study.productionLines.map(line => {
      if (line.id === selectedLine.id) {
        return {
          ...line,
          workstations: [...line.workstations, newWorkstation],
        };
      }
      return line;
    });
    
    handleSaveStudy({ productionLines: updatedLines });
    setIsWorkstationFormOpen(false);
  };

  const handleUpdateWorkstation = (updatedWorkstation: Workstation) => {
    if (!study || !selectedLine) return;
  
    const updatedLines = study.productionLines.map(line => {
      if (line.id === selectedLine.id) {
        const updatedWorkstations = line.workstations.map(ws =>
          ws.id === updatedWorkstation.id ? { ...ws, ...updatedWorkstation } : ws
        );
        return { ...line, workstations: updatedWorkstations };
      }
      return line;
    });
  
    handleSaveStudy({ productionLines: updatedLines });
    setSelectedWorkstation(null);
  };

  const handleDeleteWorkstation = (workstationToDelete: Workstation) => {
    if (!study || !selectedLine) return;
  
    const updatedLines = study.productionLines.map(line => {
      if (line.id === selectedLine.id) {
        const updatedWorkstations = line.workstations.filter(ws => ws.id !== workstationToDelete.id);
        return { ...line, workstations: updatedWorkstations };
      }
      return line;
    });
  
    handleSaveStudy({ productionLines: updatedLines });
    setSelectedWorkstation(null);
  };

  // Activities
  const handleNewActivitySubmit = (data: Activity) => {
    if (!study || !selectedLine || !selectedWorkstation) return;
    
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      description: data.description,
      type: data.type,
      collections: [],
      pfdFactor: data.pfdFactor,
    };
    
    const updatedLines = study.productionLines.map(line => {
      if (line.id === selectedLine.id) {
        const updatedWorkstations = line.workstations.map(ws => {
          if (ws.id === selectedWorkstation.id) {
            return {
              ...ws,
              activities: [...ws.activities, newActivity],
            };
          }
          return ws;
        });
        return { ...line, workstations: updatedWorkstations };
      }
      return line;
    });
    
    handleSaveStudy({ productionLines: updatedLines });
    setIsActivityFormOpen(false);
  };

  const handleUpdateActivity = (updatedActivity: Activity) => {
    if (!study || !selectedLine || !selectedWorkstation) return;
  
    const updatedLines = study.productionLines.map(line => {
      if (line.id === selectedLine.id) {
        const updatedWorkstations = line.workstations.map(ws => {
          if (ws.id === selectedWorkstation.id) {
            const updatedActivities = ws.activities.map(act =>
              act.id === updatedActivity.id ? { ...act, ...updatedActivity } : act
            );
            return { ...ws, activities: updatedActivities };
          }
          return ws;
        });
        return { ...line, workstations: updatedWorkstations };
      }
      return line;
    });
  
    handleSaveStudy({ productionLines: updatedLines });
    setSelectedActivity(null);
  };

  const handleDeleteActivity = (activityToDelete: Activity) => {
    if (!study || !selectedLine || !selectedWorkstation) return;
  
    const updatedLines = study.productionLines.map(line => {
      if (line.id === selectedLine.id) {
        const updatedWorkstations = line.workstations.map(ws => {
          if (ws.id === selectedWorkstation.id) {
            const updatedActivities = ws.activities.filter(act => act.id !== activityToDelete.id);
            return { ...ws, activities: updatedActivities };
          }
          return ws;
        });
        return { ...line, workstations: updatedWorkstations };
      }
      return line;
    });
  
    handleSaveStudy({ productionLines: updatedLines });
    setSelectedActivity(null);
  };

  // Shifts
  const handleNewShiftSubmit = (data: Shift) => {
    if (!study) return;
    
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      name: data.name,
      hours: data.hours,
      isActive: data.isActive,
    };
    
    const updatedStudy: TimeStudy = {
      ...study,
      shifts: [...study.shifts, newShift],
      updatedAt: new Date().toISOString(),
    };
    
    handleSaveStudy({ shifts: updatedStudy.shifts });
    setIsShiftFormOpen(false);
  };

  const handleUpdateShift = (updatedShift: Shift) => {
    if (!study) return;
  
    const updatedShifts = study.shifts.map(shift =>
      shift.id === updatedShift.id ? { ...shift, ...updatedShift } : shift
    );
  
    handleSaveStudy({ shifts: updatedShifts });
    setSelectedShift(null);
  };

  const handleDeleteShift = (shiftToDelete: Shift) => {
    if (!study) return;
  
    const updatedShifts = study.shifts.filter(shift => shift.id !== shiftToDelete.id);
    handleSaveStudy({ shifts: updatedShifts });
    setSelectedShift(null);
  };

  const handleGeneralFormSubmit = (data: any, isDraft: boolean = true) => {
    handleSaveStudy(data, isDraft ? 'draft' : 'active');
  };

  const renderContent = () => {
    if (!study) return <div>Carregando...</div>;
    
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
            <CardDescription>Detalhes do estudo de tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeStudyForm
              initialData={{
                client: study.client,
                modelName: study.modelName,
                studyDate: study.studyDate,
                responsiblePerson: study.responsiblePerson,
                monthlyDemand: study.monthlyDemand,
                workingDays: study.workingDays,
              }}
              onSubmit={handleGeneralFormSubmit}
              isEdit={true} // Pass isEdit=true here for edit mode
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="lines" className="space-y-4">
          <TabsList>
            <TabsTrigger value="lines">Linhas de Produção</TabsTrigger>
            <TabsTrigger value="shifts">Turnos</TabsTrigger>
          </TabsList>

          {/* Production Lines Tab */}
          <TabsContent value="lines" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsLineFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Linha
              </Button>
            </div>

            {study.productionLines.length === 0 ? (
              <Card className="text-center p-8">
                <CardHeader>
                  <CardTitle>Nenhuma linha de produção cadastrada</CardTitle>
                  <CardDescription>
                    Adicione linhas de produção para detalhar o estudo de tempo.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {study.productionLines.map((line) => (
                  <Card key={line.id} className="h-full">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        {line.name}
                      </CardTitle>
                      <CardDescription>{line.notes}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Postos:</span>
                          <span>{line.workstations.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Cycle Time:</span>
                          <span>{line.cycleTime}</span>
                        </div>
                        {/* Add more line details here */}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLine(line);
                          setIsWorkstationFormOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Posto
                      </Button>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLine(line);
                            setIsLineFormOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLine(line);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Shifts Tab */}
          <TabsContent value="shifts" className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setIsShiftFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Turno
              </Button>
            </div>

            {study.shifts.length === 0 ? (
              <Card className="text-center p-8">
                <CardHeader>
                  <CardTitle>Nenhum turno cadastrado</CardTitle>
                  <CardDescription>
                    Adicione turnos para detalhar o estudo de tempo.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {study.shifts.map((shift) => (
                  <Card key={shift.id} className="h-full">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        {shift.name}
                      </CardTitle>
                      <CardDescription>{shift.hours} horas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ativo:</span>
                          <span>{shift.isActive ? 'Sim' : 'Não'}</span>
                        </div>
                        {/* Add more shift details here */}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div></div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShift(shift);
                            setIsShiftFormOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShift(shift);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <BasePage 
      title={study ? `${study.client} - ${study.modelName}` : "Detalhes do Estudo"}
      subtitle={study ? `Estudo criado por ${study.createdBy} em ${format(new Date(study.createdAt), 'dd/MM/yyyy', { locale: ptBR })}` : ""}
    >
      <Button variant="ghost" onClick={() => navigate('/time-studies')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      {renderContent()}

      {/* Delete Study Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteStudy}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Line Form Dialog */}
      <Dialog open={isLineFormOpen} onOpenChange={() => setIsLineFormOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedLine ? 'Editar Linha' : 'Nova Linha'}</DialogTitle>
          </DialogHeader>
          <ProductionLineForm 
            onSubmit={selectedLine ? handleUpdateLine : handleNewLineSubmit}
            onCancel={() => {
              setIsLineFormOpen(false);
              setSelectedLine(null);
            }}
            initialData={selectedLine}
          />
        </DialogContent>
      </Dialog>

      {/* Workstation Form Dialog */}
      <Dialog open={isWorkstationFormOpen} onOpenChange={() => setIsWorkstationFormOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedWorkstation ? 'Editar Posto' : 'Novo Posto'}</DialogTitle>
          </DialogHeader>
          <WorkstationForm
            onSubmit={selectedWorkstation ? handleUpdateWorkstation : handleNewWorkstationSubmit}
            onCancel={() => {
              setIsWorkstationFormOpen(false);
              setSelectedWorkstation(null);
            }}
            initialData={selectedWorkstation}
          />
        </DialogContent>
      </Dialog>

      {/* Activity Form Dialog */}
      <Dialog open={isActivityFormOpen} onOpenChange={() => setIsActivityFormOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedActivity ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
          </DialogHeader>
          <ActivityForm
            onSubmit={selectedActivity ? handleUpdateActivity : handleNewActivitySubmit}
            onCancel={() => {
              setIsActivityFormOpen(false);
              setSelectedActivity(null);
            }}
            initialData={selectedActivity}
          />
        </DialogContent>
      </Dialog>

      {/* Shift Form Dialog */}
      <Dialog open={isShiftFormOpen} onOpenChange={() => setIsShiftFormOpen(false)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedShift ? 'Editar Turno' : 'Novo Turno'}</DialogTitle>
          </DialogHeader>
          <ShiftForm
            onSubmit={selectedShift ? handleUpdateShift : handleNewShiftSubmit}
            onCancel={() => {
              setIsShiftFormOpen(false);
              setSelectedShift(null);
            }}
            initialData={selectedShift}
          />
        </DialogContent>
      </Dialog>
    </BasePage>
  );
};

export default TimeStudyDetail;
