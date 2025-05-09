
import React, { useState } from 'react';
import { Workstation, TimeStudy, Activity } from '@/utils/types';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, Clock, RotateCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActivityForm } from './ActivityForm';
import { Badge } from '@/components/ui/badge';

interface WorkstationListProps {
  workstations: Workstation[];
  lineId: string;
  study: TimeStudy;
  onStudyUpdate: (study: TimeStudy) => void;
  updateHistory: (action: string, details: string) => void;
}

export function WorkstationList({ 
  workstations, 
  lineId, 
  study, 
  onStudyUpdate, 
  updateHistory 
}: WorkstationListProps) {
  const { toast } = useToast();
  const [expandedWorkstations, setExpandedWorkstations] = useState<Record<string, boolean>>({});
  const [isEditingActivity, setIsEditingActivity] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [currentWorkstationId, setCurrentWorkstationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddActivity = (workstationId: string) => {
    setCurrentWorkstationId(workstationId);
    setIsAddingActivity(true);
  };

  const handleEditActivity = (workstationId: string, activity: Activity) => {
    setCurrentActivity(activity);
    setCurrentWorkstationId(workstationId);
    setIsEditingActivity(true);
  };

  const handleCreateActivity = (newActivity: Activity) => {
    if (!currentWorkstationId) return;
    setIsLoading(true);

    try {
      // Calculate averageNormalTime
      let averageNormalTime = 0;
      if (newActivity.collections && newActivity.collections.length > 0) {
        const totalTime = newActivity.collections.reduce((sum, collection) => {
          const value = typeof collection === 'object' ? collection.value : collection;
          return sum + Number(value);
        }, 0);
        averageNormalTime = totalTime / newActivity.collections.length;
      }
      
      // Calculate cycleTime with PF&D factor
      const cycleTime = averageNormalTime * (1 + (newActivity.pfdFactor || 0));
      
      // Add calculated values
      const activityWithCalculations = {
        ...newActivity,
        averageNormalTime,
        cycleTime
      };

      const updatedLines = study.productionLines.map(line => ({
        ...line,
        workstations: line.workstations.map(ws => {
          if (ws.id === currentWorkstationId) {
            return {
              ...ws,
              activities: [...ws.activities, activityWithCalculations]
            };
          }
          return ws;
        })
      }));

      onStudyUpdate({
        ...study,
        productionLines: updatedLines,
        updatedAt: new Date().toISOString()
      });
    
      updateHistory('create', `Adicionada atividade "${newActivity.description}"`);
      toast({
        description: "Atividade adicionada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar atividade:", error);
      toast({
        variant: "destructive",
        description: "Erro ao adicionar atividade."
      });
    } finally {
      setIsLoading(false);
      setCurrentActivity(null);
      setCurrentWorkstationId(null);
      setIsAddingActivity(false);
    }
  };

  const handleUpdateActivity = (updatedActivity: Activity) => {
    if (!currentWorkstationId) return;
    setIsLoading(true);

    try {
      // Calculate averageNormalTime
      let averageNormalTime = 0;
      if (updatedActivity.collections && updatedActivity.collections.length > 0) {
        const totalTime = updatedActivity.collections.reduce((sum, collection) => {
          const value = typeof collection === 'object' ? collection.value : collection;
          return sum + Number(value);
        }, 0);
        averageNormalTime = totalTime / updatedActivity.collections.length;
      }
      
      // Calculate cycleTime with PF&D factor
      const cycleTime = averageNormalTime * (1 + (updatedActivity.pfdFactor || 0));
      
      // Add calculated values
      const activityWithCalculations = {
        ...updatedActivity,
        averageNormalTime,
        cycleTime
      };

      const updatedLines = study.productionLines.map(line => ({
        ...line,
        workstations: line.workstations.map(ws => {
          if (ws.id === currentWorkstationId) {
            return {
              ...ws,
              activities: ws.activities.map(act => 
                act.id === updatedActivity.id ? activityWithCalculations : act
              )
            };
          }
          return ws;
        })
      }));

      onStudyUpdate({
        ...study,
        productionLines: updatedLines,
        updatedAt: new Date().toISOString()
      });
    
      updateHistory('update', `Atualizada atividade "${updatedActivity.description}"`);
      toast({
        description: "Atividade atualizada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar atividade:", error);
      toast({
        variant: "destructive",
        description: "Erro ao atualizar atividade."
      });
    } finally {
      setIsLoading(false);
      setCurrentActivity(null);
      setCurrentWorkstationId(null);
      setIsEditingActivity(false);
    }
  };

  const handleDeleteActivity = (workstationId: string, activityId: string, activityName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a atividade "${activityName}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const updatedLines = study.productionLines.map(line => ({
        ...line,
        workstations: line.workstations.map(ws => {
          if (ws.id === workstationId) {
            return {
              ...ws,
              activities: ws.activities.filter(act => act.id !== activityId)
            };
          }
          return ws;
        })
      }));

      onStudyUpdate({
        ...study,
        productionLines: updatedLines,
        updatedAt: new Date().toISOString()
      });
    
      updateHistory('delete', `Removida atividade "${activityName}"`);
      toast({
        description: "Atividade removida com sucesso."
      });
    } catch (error) {
      console.error("Erro ao remover atividade:", error);
      toast({
        variant: "destructive",
        description: "Erro ao remover atividade."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAverageTime = (activity: Activity): number => {
    if (!activity.collections || activity.collections.length === 0) {
      return 0;
    }
    
    const totalTime = activity.collections.reduce((sum, collection) => {
      const value = typeof collection === 'object' ? collection.value : collection;
      return sum + Number(value);
    }, 0);
    
    return totalTime / activity.collections.length;
  };

  const calculateCycleTime = (activity: Activity): number => {
    const averageTime = calculateAverageTime(activity);
    return averageTime * (1 + (activity.pfdFactor || 0));
  };

  const toggleWorkstationExpansion = (workstationId: string) => {
    setExpandedWorkstations(prev => ({
      ...prev,
      [workstationId]: !prev[workstationId]
    }));
  };

  return (
    <>
      <Accordion type="multiple" className="w-full">
        {workstations.map((workstation) => {
          // Calcula se a estação é um gargalo (tem o maior tempo de ciclo)
          const isBottleneck = study.productionLines
            .flatMap(line => line.workstations)
            .filter(ws => ws.id !== workstation.id)
            .every(otherWs => {
              const maxOtherCycleTime = Math.max(
                ...otherWs.activities
                  .filter(a => a.collections && a.collections.length > 0)
                  .map(a => calculateCycleTime(a)),
                0
              );
              const maxCurrentCycleTime = Math.max(
                ...workstation.activities
                  .filter(a => a.collections && a.collections.length > 0)
                  .map(a => calculateCycleTime(a)),
                0
              );
              return maxCurrentCycleTime >= maxOtherCycleTime;
            });

          return (
            <AccordionItem 
              value={workstation.id} 
              key={workstation.id} 
              className={`
                border dark:border-primary/10 rounded-md mb-2 dark:bg-card/40 overflow-hidden
                ${isBottleneck ? 'border-destructive/60 dark:border-destructive/60' : ''}
              `}
            >
              <AccordionTrigger 
                className="hover:bg-muted/50 dark:hover:bg-primary/10 px-4 rounded-md"
                onClick={() => toggleWorkstationExpansion(workstation.id)}
              >
                <div className="flex items-center">
                  <span className="font-medium flex items-center">
                    {isBottleneck && (
                      <span className="text-destructive mr-1" title="Gargalo">⚠️</span>
                    )}
                    💻 Posto {workstation.number}
                    {workstation.name && ` - ${workstation.name}`}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {workstation.activities.length} atividade(s)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 dark:bg-card/60">
                <div className="space-y-4">
                  {workstation.notes && (
                    <p className="text-sm text-muted-foreground">{workstation.notes}</p>
                  )}

                  <div className="flex justify-end mb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="dark:bg-primary/10 dark:hover:bg-primary/20"
                      onClick={() => handleAddActivity(workstation.id)}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Adicionar Atividade
                    </Button>
                  </div>

                  {workstation.activities.length > 0 ? (
                    <div className="space-y-2 pl-4 border-l border-dashed border-primary/20 dark:border-primary/30">
                      {workstation.activities.map((activity) => {
                        const avgTime = calculateAverageTime(activity);
                        const cycleTime = calculateCycleTime(activity);

                        // Atualizar os tempos calculados para exibição
                        if (!activity.averageNormalTime) {
                          activity.averageNormalTime = avgTime;
                        }
                        if (!activity.cycleTime) {
                          activity.cycleTime = cycleTime;
                        }

                        return (
                          <div
                            key={activity.id}
                            className="p-3 border rounded-md dark:bg-card/80 dark:border-primary/10 hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="w-full">
                                <p className="font-medium">📋 {activity.description}</p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Badge variant={
                                    activity.type === 'Manual' 
                                      ? 'default' 
                                      : 'secondary'
                                  }>
                                    {activity.type}
                                  </Badge>
                                  <span>PF&D: {(activity.pfdFactor * 100).toFixed(0)}%</span>
                                  <span className="cursor-pointer hover:underline flex items-center gap-1" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditActivity(workstation.id, activity);
                                    }}
                                    title="Clique para editar as coletas">
                                    <Clock className="h-3 w-3" />
                                    {activity.collections.length} coleta(s): {activity.collections.map((c, idx) => {
                                      // Ensure we properly handle the collection value type
                                      const value = typeof c === 'object' ? c.value : c;
                                      // Convert to number before using toFixed
                                      return (
                                        <span key={idx} className="inline-block">
                                          {Number(value).toFixed(2)}s{idx < activity.collections.length - 1 ? ', ' : ''}
                                        </span>
                                      );
                                    })}
                                  </span>
                                  <Badge variant="outline" className="bg-green-100/10">
                                    T.M.: {Number(activity.averageNormalTime).toFixed(2)}s
                                  </Badge>
                                  <Badge variant="outline" className="bg-purple-100/10">
                                    T.C.: {Number(activity.cycleTime).toFixed(2)}s
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2 flex-shrink-0">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditActivity(workstation.id, activity);
                                  }}
                                  className="dark:hover:bg-primary/20"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteActivity(workstation.id, activity.id, activity.description);
                                  }}
                                  className="dark:hover:bg-destructive/20 dark:text-destructive/70"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">
                      Nenhuma atividade cadastrada
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Dialog para editar atividade */}
      <Dialog open={isEditingActivity} onOpenChange={setIsEditingActivity}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Atividade</DialogTitle>
          </DialogHeader>
          {currentActivity && (
            <ActivityForm
              initialData={currentActivity}
              onSubmit={handleUpdateActivity}
              onCancel={() => {
                setCurrentActivity(null);
                setCurrentWorkstationId(null);
                setIsEditingActivity(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar atividade */}
      <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Atividade</DialogTitle>
          </DialogHeader>
          <ActivityForm
            onSubmit={handleCreateActivity}
            onCancel={() => {
              setCurrentWorkstationId(null);
              setIsAddingActivity(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
