
import React, { useState } from 'react';
import { Edit, Trash2, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProductionLine, Workstation, TimeStudy } from '@/utils/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WorkstationForm } from './WorkstationForm';
import { useToast } from '@/components/ui/use-toast';
import { ActivityForm } from './ActivityForm';

interface AccordionLineItemProps {
  line: ProductionLine;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: (id: string, name: string) => void;
  onAddWorkstation: () => void;
  onAddActivity?: (workstation: Workstation) => void;
  study: TimeStudy;
  onStudyUpdate: (study: TimeStudy) => void;
  updateHistory: (action: string, details: string) => void;
}

export function AccordionLineItem({
  line,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddWorkstation,
  onAddActivity,
  study,
  onStudyUpdate,
  updateHistory,
}: AccordionLineItemProps) {
  const [selectedWorkstation, setSelectedWorkstation] = useState<Workstation | null>(null);
  const [isEditingWorkstation, setIsEditingWorkstation] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const { toast } = useToast();

  const handleEditWorkstation = (workstation: Workstation) => {
    setSelectedWorkstation(workstation);
    setIsEditingWorkstation(true);
  };

  const handleUpdateWorkstation = (updatedWorkstation: Partial<Workstation>) => {
    if (!selectedWorkstation) return;

    const updatedLines = study.productionLines.map(l => {
      if (l.id === line.id) {
        return {
          ...l,
          workstations: l.workstations.map(ws => {
            if (ws.id === selectedWorkstation.id) {
              return {
                ...ws,
                number: updatedWorkstation.number || ws.number,
                name: updatedWorkstation.name || ws.name,
                notes: updatedWorkstation.notes !== undefined ? updatedWorkstation.notes : ws.notes,
              };
            }
            return ws;
          }),
        };
      }
      return l;
    });

    const updatedStudy = {
      ...study,
      productionLines: updatedLines,
      updatedAt: new Date().toISOString(),
    };

    onStudyUpdate(updatedStudy);
    updateHistory(
      'update',
      `Atualizado posto de trabalho ${updatedWorkstation.number || selectedWorkstation.number} ${
        updatedWorkstation.name || selectedWorkstation.name ? '- ' + (updatedWorkstation.name || selectedWorkstation.name) : ''
      }`
    );

    toast({
      title: 'Posto de trabalho atualizado',
      description: 'O posto de trabalho foi atualizado com sucesso.',
    });

    setSelectedWorkstation(null);
    setIsEditingWorkstation(false);
  };

  const handleDeleteWorkstation = (workstation: Workstation) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o posto de trabalho "${workstation.number} ${
          workstation.name ? '- ' + workstation.name : ''
        }"? Esta ação não pode ser desfeita.`
      )
    ) {
      const updatedLines = study.productionLines.map(l => {
        if (l.id === line.id) {
          return {
            ...l,
            workstations: l.workstations.filter(ws => ws.id !== workstation.id),
          };
        }
        return l;
      });

      const updatedStudy = {
        ...study,
        productionLines: updatedLines,
        updatedAt: new Date().toISOString(),
      };

      onStudyUpdate(updatedStudy);
      updateHistory(
        'delete',
        `Removido posto de trabalho ${workstation.number} ${workstation.name ? '- ' + workstation.name : ''}`
      );

      toast({
        title: 'Posto de trabalho removido',
        description: 'O posto de trabalho foi removido com sucesso.',
      });
    }
  };

  const handleAddActivity = (workstation: Workstation) => {
    if (onAddActivity) {
      onAddActivity(workstation);
    } else {
      setSelectedWorkstation(workstation);
      setIsAddingActivity(true);
    }
  };

  const handleActivitySubmit = (activityData: any) => {
    if (!selectedWorkstation) return;

    // Find the workstation and add the activity
    const updatedLines = study.productionLines.map(l => {
      if (l.id === line.id) {
        return {
          ...l,
          workstations: l.workstations.map(ws => {
            if (ws.id === selectedWorkstation.id) {
              // Calcular tempos médios e de ciclo para a nova atividade
              let collections = activityData.collections;
              
              if (Array.isArray(collections) && collections.length > 0) {
                // Ensure collections are in the correct format
                if (typeof collections[0] !== 'object') {
                  collections = collections.map(value => ({
                    id: `collection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    value: value
                  }));
                }
              }
              
              // Calculate averageNormalTime
              let averageNormalTime = 0;
              if (collections && collections.length > 0) {
                const totalTime = collections.reduce((sum, collection) => {
                  const value = typeof collection === 'object' ? collection.value : collection;
                  return sum + value;
                }, 0);
                averageNormalTime = totalTime / collections.length;
              }
              
              // Calculate cycleTime with PF&D factor
              const cycleTime = averageNormalTime * (1 + (activityData.pfdFactor || 0));
              
              const newActivity = {
                id: `activity-${Date.now()}`,
                ...activityData,
                collections,
                averageNormalTime,
                cycleTime
              };
              
              return {
                ...ws,
                activities: [...ws.activities, newActivity],
              };
            }
            return ws;
          }),
        };
      }
      return l;
    });

    const updatedStudy = {
      ...study,
      productionLines: updatedLines,
      updatedAt: new Date().toISOString(),
    };

    onStudyUpdate(updatedStudy);
    updateHistory('update', `Adicionada atividade "${activityData.description}" ao posto de trabalho ${selectedWorkstation.number}`);

    toast({
      title: 'Atividade adicionada',
      description: 'A atividade foi adicionada com sucesso.',
    });

    setSelectedWorkstation(null);
    setIsAddingActivity(false);
  };

  return (
    <>
      <Collapsible open={isExpanded} onOpenChange={onToggle} className="border rounded-lg">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer bg-muted/40 hover:bg-muted/60">
            <div className="flex items-center space-x-2">
              {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              <h3 className="text-lg font-medium">{line.name}</h3>
              {line.notes && <span className="text-sm text-muted-foreground">({line.notes})</span>}
            </div>
            <div className="flex space-x-2" onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(line.id, line.name)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 space-y-4">
            {line.workstations.length > 0 ? (
              <div className="space-y-4">
                {line.workstations.map(workstation => (
                  <Card key={workstation.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/30 py-2">
                      <CardTitle className="flex justify-between items-center text-base font-medium">
                        <span>
                          Posto {workstation.number} {workstation.name && `- ${workstation.name}`}
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddActivity(workstation)}
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Atividade
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditWorkstation(workstation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWorkstation(workstation)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-3">
                      {workstation.activities && workstation.activities.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Atividades:</h4>
                          <ul className="space-y-1">
                            {workstation.activities.map(activity => (
                              <li key={activity.id} className="text-sm">
                                <div className="flex justify-between">
                                  <span>{activity.description}</span>
                                  <span className="text-muted-foreground">{activity.type}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma atividade cadastrada para este posto.{' '}
                          <Button
                            variant="link"
                            className="h-auto p-0"
                            onClick={() => handleAddActivity(workstation)}
                          >
                            Adicionar atividade
                          </Button>
                        </p>
                      )}
                      {workstation.notes && (
                        <div className="mt-2 pt-2 border-t text-sm">
                          <span className="font-medium">Observações:</span> {workstation.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Nenhum posto de trabalho cadastrado para esta linha.</p>
              </div>
            )}
            <div className="flex justify-center">
              <Button onClick={onAddWorkstation}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Posto de Trabalho
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Dialog para editar posto de trabalho */}
      <Dialog open={isEditingWorkstation} onOpenChange={setIsEditingWorkstation}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Posto de Trabalho</DialogTitle>
          </DialogHeader>
          <WorkstationForm
            initialData={selectedWorkstation || undefined}
            onSubmit={handleUpdateWorkstation}
            onCancel={() => {
              setSelectedWorkstation(null);
              setIsEditingWorkstation(false);
            }}
            isLoading={false}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar atividade (usado apenas quando onAddActivity não é fornecido) */}
      {!onAddActivity && (
        <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Atividade</DialogTitle>
            </DialogHeader>
            <ActivityForm
              onSubmit={handleActivitySubmit}
              onCancel={() => {
                setSelectedWorkstation(null);
                setIsAddingActivity(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
