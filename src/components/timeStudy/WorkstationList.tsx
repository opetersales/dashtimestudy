
import React, { useState } from 'react';
import { Workstation, TimeStudy, Activity } from '@/utils/types';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActivityForm } from './ActivityForm';

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
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [currentWorkstationId, setCurrentWorkstationId] = useState<string | null>(null);

  const handleEditActivity = (workstationId: string, activity: Activity) => {
    setCurrentActivity(activity);
    setCurrentWorkstationId(workstationId);
    setIsEditingActivity(true);
  };

  const handleUpdateActivity = (updatedActivity: Activity) => {
    if (!currentWorkstationId) return;

    const updatedLines = study.productionLines.map(line => ({
      ...line,
      workstations: line.workstations.map(ws => {
        if (ws.id === currentWorkstationId) {
          return {
            ...ws,
            activities: ws.activities.map(act => 
              act.id === updatedActivity.id ? updatedActivity : act
            )
          };
        }
        return ws;
      })
    }));

    onStudyUpdate({
      ...study,
      productionLines: updatedLines,
    });
  
    updateHistory('update', `Atualizada atividade "${updatedActivity.description}"`);
    toast({
      description: "Atividade atualizada com sucesso."
    });

    setCurrentActivity(null);
    setCurrentWorkstationId(null);
    setIsEditingActivity(false);
  };

  const handleDeleteActivity = (workstationId: string, activityId: string, activityName: string) => {
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
    });
  
    updateHistory('delete', `Removida atividade "${activityName}"`);
    toast({
      description: "Atividade removida com sucesso."
    });
  };

  const calculateAverageTime = (activity: Activity): number => {
    if (!activity.collections || activity.collections.length === 0) {
      return 0;
    }
    
    const totalTime = activity.collections.reduce((sum, collection) => {
      const value = typeof collection === 'object' ? collection.value : collection;
      return sum + value;
    }, 0);
    
    return totalTime / activity.collections.length;
  };

  const calculateCycleTime = (activity: Activity): number => {
    const averageTime = calculateAverageTime(activity);
    return averageTime * (1 + (activity.pfdFactor || 0));
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
              <AccordionTrigger className="hover:bg-muted/50 dark:hover:bg-primary/10 px-4 rounded-md">
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
                            className="p-3 border rounded-md dark:bg-card/80 dark:border-primary/10"
                          >
                            <div className="flex justify-between items-start">
                              <div className="w-full">
                                <p className="font-medium">📋 {activity.description}</p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <span className={`px-2 py-0.5 rounded-full ${
                                    activity.type === 'Manual' 
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-300'
                                  }`}>
                                    {activity.type}
                                  </span>
                                  <span>PF&D: {(activity.pfdFactor * 100).toFixed(0)}%</span>
                                  <span>
                                    {activity.collections.length} coleta(s): {activity.collections.map(c => {
                                      // Ensure we properly handle the collection value type
                                      const value = typeof c === 'object' ? c.value : c;
                                      // Convert to number before using toFixed
                                      return Number(value).toFixed(2);
                                    }).join(', ')}s
                                  </span>
                                  <span 
                                    className="tooltip-hover rounded-full px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-300"
                                    title="Tempo médio normal (sem PF&D)"
                                  >
                                    T.M.: {activity.averageNormalTime.toFixed(2)}s
                                  </span>
                                  <span 
                                    className="tooltip-hover rounded-full px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-300"
                                    title="Tempo de ciclo (com PF&D aplicado)"
                                  >
                                    T.C.: {activity.cycleTime.toFixed(2)}s
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2 flex-shrink-0">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditActivity(workstation.id, activity)}
                                  className="dark:hover:bg-primary/20"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteActivity(workstation.id, activity.id, activity.description)}
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
    </>
  );
}
