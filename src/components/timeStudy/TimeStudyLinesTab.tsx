import React, { useState } from 'react';
import { ProductionLine, TimeStudy, Workstation, Activity } from '@/utils/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { WorkstationForm } from './WorkstationForm';
import { ActivityForm } from './ActivityForm';
import { ProductionLineForm } from './ProductionLineForm';

interface TimeStudyLinesTabProps {
  study: TimeStudy;
  onStudyUpdate: (study: TimeStudy) => void;
  updateHistory: (action: string, details: string) => void;
}

export function TimeStudyLinesTab({ study, onStudyUpdate, updateHistory }: TimeStudyLinesTabProps) {
  const { toast } = useToast();
  const [isAddingWorkstation, setIsAddingWorkstation] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isEditingLine, setIsEditingLine] = useState(false);
  const [currentLine, setCurrentLine] = useState<ProductionLine | null>(null);
  const [currentWorkstation, setCurrentWorkstation] = useState<Workstation | null>(null);

  const handleAddWorkstation = (lineId: string, workstationData: Partial<Workstation>) => {
    const newWorkstation: Workstation = {
      id: `ws-${Date.now()}`,
      number: workstationData.number || '01',
      name: workstationData.name || '',
      notes: workstationData.notes || '',
      activities: [],
    };

    const updatedLines = study.productionLines.map(line => {
      if (line.id === lineId) {
        return {
          ...line,
          workstations: [...line.workstations, newWorkstation],
        };
      }
      return line;
    });

    const updatedStudy = {
      ...study,
      productionLines: updatedLines,
      updatedAt: new Date().toISOString()
    };

    onStudyUpdate(updatedStudy);
    updateHistory('update', `Adicionado posto de trabalho "${newWorkstation.number} ${newWorkstation.name ? '- ' + newWorkstation.name : ''}"`);

    toast({
      title: "Posto adicionado",
      description: "O posto de trabalho foi adicionado com sucesso."
    });

    setCurrentLine(null);
    setIsAddingWorkstation(false);
  };

  const handleAddActivity = (workstationId: string, activityData: Partial<Activity>) => {
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      description: activityData.description || '',
      type: activityData.type || 'Manual',
      collections: activityData.collections || [],
      pfdFactor: activityData.pfdFactor !== undefined ? activityData.pfdFactor : 0.1,
    };

    const updatedLines = study.productionLines.map(line => {
      return {
        ...line,
        workstations: line.workstations.map(ws => {
          if (ws.id === workstationId) {
            return {
              ...ws,
              activities: [...ws.activities, newActivity],
            };
          }
          return ws;
        })
      };
    });

    const updatedStudy = {
      ...study,
      productionLines: updatedLines,
      updatedAt: new Date().toISOString()
    };

    onStudyUpdate(updatedStudy);
    updateHistory('update', `Adicionada atividade "${newActivity.description}" ao posto de trabalho ${currentWorkstation?.number}`);

    toast({
      title: "Atividade adicionada",
      description: "A atividade foi adicionada com sucesso."
    });

    setCurrentWorkstation(null);
    setIsAddingActivity(false);
  };

  const handleUpdateLine = (lineData: Partial<ProductionLine>) => {
    if (!currentLine) return;

    const updatedLines = study.productionLines.map(line => {
      if (line.id === currentLine.id) {
        return {
          ...line,
          name: lineData.name || line.name,
          notes: lineData.notes !== undefined ? lineData.notes : line.notes,
        };
      }
      return line;
    });

    const updatedStudy = {
      ...study,
      productionLines: updatedLines,
      updatedAt: new Date().toISOString()
    };

    onStudyUpdate(updatedStudy);
    updateHistory('update', `Atualizada linha de produção "${lineData.name}"`);

    toast({
      title: "Linha atualizada",
      description: "A linha de produção foi atualizada com sucesso."
    });

    setCurrentLine(null);
    setIsEditingLine(false);
  };

  const handleDeleteLine = (lineId: string, lineName: string) => {
    const updatedLines = study.productionLines.filter(line => line.id !== lineId);

    const updatedStudy = {
      ...study,
      productionLines: updatedLines,
      updatedAt: new Date().toISOString()
    };

    onStudyUpdate(updatedStudy);
    updateHistory('delete', `Removida linha de produção "${lineName}"`);

    toast({
      title: "Linha removida",
      description: `A linha "${lineName}" foi removida com sucesso.`
    });
  };

  return (
    <div className="space-y-6">
      {study.productionLines.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Nenhuma linha de produção configurada</CardTitle>
            <CardDescription>
              Adicione uma linha de produção para começar a registrar postos de trabalho e atividades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsAddingWorkstation(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Linha
            </Button>
          </CardContent>
        </Card>
      ) : (
        study.productionLines.map(line => (
          <Card key={line.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{line.name}</CardTitle>
                {line.notes && <CardDescription>{line.notes}</CardDescription>}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline" 
                  size="icon"
                  onClick={() => {
                    setCurrentLine(line);
                    setIsEditingLine(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDeleteLine(line.id, line.name)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setCurrentLine(line);
                      setIsAddingWorkstation(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Posto de Trabalho
                  </Button>
                </div>

                {line.workstations.length > 0 ? (
                  <Accordion type="multiple" className="w-full">
                    {line.workstations.map((workstation) => (
                      <AccordionItem value={workstation.id} key={workstation.id}>
                        <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                          <div className="flex items-center">
                            <span className="font-medium">
                              Posto {workstation.number}
                              {workstation.name && ` - ${workstation.name}`}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {workstation.activities.length} atividade(s)
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-2">
                          <div className="space-y-4">
                            {workstation.notes && (
                              <p className="text-sm text-muted-foreground">{workstation.notes}</p>
                            )}

                            <div className="flex justify-end mb-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCurrentWorkstation(workstation);
                                  setIsAddingActivity(true);
                                }}
                              >
                                <Plus className="mr-2 h-3 w-3" />
                                Adicionar Atividade
                              </Button>
                            </div>

                            {workstation.activities.length > 0 ? (
                              <div className="space-y-2">
                                {workstation.activities.map((activity) => (
                                  <div
                                    key={activity.id}
                                    className="p-3 border rounded-md"
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-medium">{activity.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                          <span className={`px-2 py-0.5 rounded-full ${
                                            activity.type === 'Manual' 
                                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                          }`}>
                                            {activity.type}
                                          </span>
                                          <span>PF&D: {(activity.pfdFactor * 100).toFixed(0)}%</span>
                                          <span>{activity.collections.length} coleta(s)</span>
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button variant="ghost" size="icon">
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                          <Trash className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-center text-muted-foreground py-4">
                                Nenhuma atividade cadastrada
                              </p>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum posto de trabalho cadastrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Add workstation dialog */}
      <Dialog open={isAddingWorkstation} onOpenChange={setIsAddingWorkstation}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Posto de Trabalho</DialogTitle>
          </DialogHeader>
          <WorkstationForm
            onSubmit={(data) => currentLine && handleAddWorkstation(currentLine.id, data)}
            onCancel={() => {
              setCurrentLine(null);
              setIsAddingWorkstation(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit line dialog */}
      <Dialog open={isEditingLine} onOpenChange={setIsEditingLine}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Linha de Produção</DialogTitle>
          </DialogHeader>
          <ProductionLineForm
            initialData={currentLine || undefined}
            onSubmit={handleUpdateLine}
            onCancel={() => {
              setCurrentLine(null);
              setIsEditingLine(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add activity dialog */}
      <Dialog open={isAddingActivity} onOpenChange={setIsAddingActivity}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Atividade</DialogTitle>
          </DialogHeader>
          <ActivityForm
            onSubmit={(data) => currentWorkstation && handleAddActivity(currentWorkstation.id, data)}
            onCancel={() => {
              setCurrentWorkstation(null);
              setIsAddingActivity(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
