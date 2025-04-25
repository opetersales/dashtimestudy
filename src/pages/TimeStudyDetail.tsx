
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BasePage } from '@/components/layout/BasePage';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Edit, Plus, Trash2 } from 'lucide-react';
import { TimeStudy, ProductionLine, Workstation, Activity, Shift } from '@/utils/types';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { ProductionLineForm, WorkstationForm, ActivityForm, ShiftForm } from '@/components/timeStudy/forms';

const TimeStudyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [study, setStudy] = useState<TimeStudy | null>(null);
  
  // State for forms
  const [isLineFormOpen, setIsLineFormOpen] = useState(false);
  const [isWorkstationFormOpen, setIsWorkstationFormOpen] = useState(false);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [isShiftFormOpen, setIsShiftFormOpen] = useState(false);
  
  // State for selection
  const [selectedLine, setSelectedLine] = useState<ProductionLine | null>(null);
  const [selectedWorkstation, setSelectedWorkstation] = useState<Workstation | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const studies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
    const foundStudy = studies.find(s => s.id === id);
    
    if (foundStudy) {
      setStudy(foundStudy);
    } else {
      toast({
        title: "Estudo não encontrado",
        description: "O estudo que você está procurando não existe.",
        variant: "destructive"
      });
      navigate('/studies');
    }
  }, [id, navigate, toast]);

  // Function to get current user name
  const getUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };

  // Function to record history
  const updateHistory = (action: string, details: string) => {
    if (!study) return;
    
    const history = loadFromLocalStorage<any[]>('history', []);
    const newHistoryItem = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString(),
      user: getUserName(),
      action: action,
      details: details,
      entityType: 'timeStudy',
      entityId: study.id,
      entityName: `${study.client} - ${study.modelName}`,
    };
    history.unshift(newHistoryItem);
    saveToLocalStorage('history', history);
  };

  const handleSaveStudy = (updatedData: Partial<TimeStudy>) => {
    if (!study) return;
    
    const studies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
    
    const updatedStudy: TimeStudy = {
      ...study,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    
    const updatedStudies = studies.map(s => 
      s.id === updatedStudy.id ? updatedStudy : s
    );
    
    saveToLocalStorage('timeStudies', updatedStudies);
    setStudy(updatedStudy);
    
    toast({
      title: "Estudo atualizado",
      description: `${updatedStudy.client} - ${updatedStudy.modelName} foi atualizado com sucesso.`,
    });
    
    updateHistory('update', `Atualização dos dados do estudo`);
    
    // Trigger dashboard update
    window.dispatchEvent(new Event('dashboardUpdate'));
  };

  // This function was missing in our previous fix
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

  if (!study) {
    return (
      <BasePage title="Carregando...">
        <div className="flex justify-center items-center h-64">
          <p>Carregando dados do estudo...</p>
        </div>
      </BasePage>
    );
  }

  return (
    <BasePage title={`${study.client} - ${study.modelName}`}>
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/studies')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Estudos
        </Button>
      </div>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="lines">Linhas e Postos</TabsTrigger>
          <TabsTrigger value="calculations">Cálculos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Informações Gerais</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/studies`)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Cliente</h3>
                  <p>{study.client}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Modelo do Produto</h3>
                  <p>{study.modelName}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Data do Estudo</h3>
                  <p>{new Date(study.studyDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Responsável</h3>
                  <p>{study.responsiblePerson}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Demanda Mensal</h3>
                  <p>{study.monthlyDemand.toLocaleString()} unidades</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Dias Úteis</h3>
                  <p>{study.workingDays} dias</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Demanda Diária</h3>
                  <p>{study.dailyDemand?.toLocaleString() || 'Não calculado'} unidades/dia</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Criado em</h3>
                  <p>{new Date(study.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Turnos</span>
                <Button 
                  size="sm"
                  onClick={() => setIsShiftFormOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Turno
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {study.shifts && study.shifts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {study.shifts.map(shift => (
                    <Card key={shift.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base flex justify-between">
                          <span>{shift.name}</span>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => {
                                setSelectedShift(shift);
                                setIsShiftFormOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDeleteShift(shift)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div>
                          <span className="text-sm font-medium">Horas:</span> {shift.hours}
                        </div>
                        <div>
                          <span className="text-sm font-medium">Status:</span> {shift.isActive ? 'Ativo' : 'Inativo'}
                        </div>
                        {shift.taktTime && (
                          <div>
                            <span className="text-sm font-medium">Takt Time:</span> {shift.taktTime.toFixed(2)}s
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 border-t">
                        {shift.isActive ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Ativo</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Inativo</span>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4">
                  <p>Nenhum turno cadastrado. Adicione turnos para continuar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Linhas de Produção</span>
                <Button 
                  size="sm"
                  onClick={() => setIsLineFormOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Linha
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {study.productionLines && study.productionLines.length > 0 ? (
                <div className="space-y-6">
                  {study.productionLines.map(line => (
                    <Card key={line.id} className="overflow-hidden">
                      <CardHeader className="bg-muted">
                        <CardTitle className="text-lg flex justify-between">
                          <span>{line.name}</span>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => {
                                setSelectedLine(line);
                                setIsLineFormOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteLine(line)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardTitle>
                        {line.notes && <p className="text-sm">{line.notes}</p>}
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold">Postos de Trabalho ({line.workstations?.length || 0})</h3>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedLine(line);
                              setIsWorkstationFormOpen(true);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar Posto
                          </Button>
                        </div>
                        
                        {line.workstations && line.workstations.length > 0 ? (
                          <div className="space-y-4">
                            {line.workstations.map(workstation => (
                              <Card key={workstation.id} className="overflow-hidden">
                                <CardHeader className="p-3">
                                  <CardTitle className="text-base flex justify-between">
                                    <span>Posto {workstation.number}: {workstation.name}</span>
                                    <div className="flex space-x-1">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6" 
                                        onClick={() => {
                                          setSelectedLine(line);
                                          setSelectedWorkstation(workstation);
                                          setIsWorkstationFormOpen(true);
                                        }}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleDeleteWorkstation(workstation)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  {workstation.notes && <p className="text-xs mb-2">{workstation.notes}</p>}
                                  
                                  <div className="mt-2">
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="font-medium text-sm">Atividades ({workstation.activities?.length || 0})</h4>
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        className="h-7 text-xs"
                                        onClick={() => {
                                          setSelectedLine(line);
                                          setSelectedWorkstation(workstation);
                                          setIsActivityFormOpen(true);
                                        }}
                                      >
                                        <Plus className="mr-1 h-3 w-3" />
                                        Adicionar Atividade
                                      </Button>
                                    </div>
                                    
                                    {workstation.activities && workstation.activities.length > 0 ? (
                                      <div className="space-y-2">
                                        {workstation.activities.map(activity => (
                                          <div key={activity.id} className="bg-muted p-2 rounded text-xs">
                                            <div className="flex justify-between">
                                              <span className="font-medium">{activity.description}</span>
                                              <div className="flex space-x-1">
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon" 
                                                  className="h-5 w-5" 
                                                  onClick={() => {
                                                    setSelectedLine(line);
                                                    setSelectedWorkstation(workstation);
                                                    setSelectedActivity(activity);
                                                    setIsActivityFormOpen(true);
                                                  }}
                                                >
                                                  <Edit className="h-2 w-2" />
                                                </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon"
                                                  className="h-5 w-5"
                                                  onClick={() => handleDeleteActivity(activity)}
                                                >
                                                  <Trash2 className="h-2 w-2" />
                                                </Button>
                                              </div>
                                            </div>
                                            <div className="flex justify-between mt-1">
                                              <span>Tipo: {activity.type}</span>
                                              <span>Fator PF&D: {activity.pfdFactor}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">Nenhuma atividade cadastrada para este posto.</p>
                                    )}
                                  </div>
                                </CardContent>
                                <CardFooter className="p-3 border-t">
                                  <div className="w-full flex justify-between text-xs">
                                    <span className="text-muted-foreground">Tempo de Ciclo: {workstation.cycleTime || 'N/A'}</span>
                                    <span className="text-muted-foreground">UPH: {workstation.uph || 'N/A'}</span>
                                  </div>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-center p-4">Nenhum posto de trabalho cadastrado para esta linha.</p>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 border-t">
                        <div className="w-full flex justify-between">
                          <span className="text-sm">Cycle Time: {line.cycleTime || 'Não calculado'}</span>
                          <span className="text-sm">UPH: {line.uph || 'Não calculado'}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4">
                  <p>Nenhuma linha de produção cadastrada. Adicione linhas para continuar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calculations">
          <Card>
            <CardHeader>
              <CardTitle>Cálculos e Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center p-4">
                Esta parte está em desenvolvimento. Será implementada em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios e Gráficos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center p-4">
                Esta parte está em desenvolvimento. Será implementada em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog for ProductionLine form */}
      <Dialog open={isLineFormOpen} onOpenChange={setIsLineFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedLine ? 'Editar Linha' : 'Nova Linha de Produção'}</DialogTitle>
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
      
      {/* Dialog for Workstation form */}
      <Dialog open={isWorkstationFormOpen} onOpenChange={setIsWorkstationFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedWorkstation ? 'Editar Posto' : 'Novo Posto de Trabalho'}</DialogTitle>
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
      
      {/* Dialog for Activity form */}
      <Dialog open={isActivityFormOpen} onOpenChange={setIsActivityFormOpen}>
        <DialogContent>
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
      
      {/* Dialog for Shift form */}
      <Dialog open={isShiftFormOpen} onOpenChange={setIsShiftFormOpen}>
        <DialogContent>
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
