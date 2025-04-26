
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { WorkstationForm } from './WorkstationForm';
import { ActivityForm } from './ActivityForm';
import { ProductionLineForm } from './ProductionLineForm';
import { AccordionLineItem } from './AccordionLineItem';

interface TimeStudyLinesTabProps {
  study: TimeStudy;
  onStudyUpdate: (study: TimeStudy) => void;
  updateHistory: (action: string, details: string) => void;
}

export function TimeStudyLinesTab({ study, onStudyUpdate, updateHistory }: TimeStudyLinesTabProps) {
  const { toast } = useToast();
  const [isAddingLine, setIsAddingLine] = useState(false);
  const [isAddingWorkstation, setIsAddingWorkstation] = useState(false);
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [isEditingLine, setIsEditingLine] = useState(false);
  const [currentLine, setCurrentLine] = useState<ProductionLine | null>(null);
  const [currentWorkstation, setCurrentWorkstation] = useState<Workstation | null>(null);
  const [expandedLines, setExpandedLines] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const toggleLineExpansion = (lineId: string) => {
    setExpandedLines(prev => ({
      ...prev,
      [lineId]: !prev[lineId]
    }));
  };

  const handleAddLine = (lineData: Partial<ProductionLine>) => {
    const newLine: ProductionLine = {
      id: `line-${Date.now()}`,
      name: lineData.name || 'Nova Linha',
      notes: lineData.notes || '',
      workstations: []
    };

    const updatedStudy = {
      ...study,
      productionLines: [...study.productionLines, newLine],
      updatedAt: new Date().toISOString()
    };

    onStudyUpdate(updatedStudy);
    updateHistory('create', `Adicionada linha de produção "${newLine.name}"`);

    toast({
      title: "Linha adicionada",
      description: "A linha foi adicionada com sucesso."
    });

    setIsAddingLine(false);
    setExpandedLines(prev => ({
      ...prev,
      [newLine.id]: true
    }));
  };

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

    setExpandedLines(prev => ({
      ...prev,
      [lineId]: true
    }));
  };

  const handleAddActivity = (workstationId: string, activityData: Partial<Activity>) => {
    setIsLoading(true);
    try {
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        description: activityData.description || '',
        type: activityData.type || 'Manual',
        collections: activityData.collections || [],
        pfdFactor: activityData.pfdFactor !== undefined ? activityData.pfdFactor : 0.15, // 15% default
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLine = (lineData: Partial<ProductionLine>) => {
    if (!currentLine) return;
    setIsLoading(true);
    
    try {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLine = (lineId: string, lineName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a linha "${lineName}"? Esta ação não pode ser desfeita.`)) {
      setIsLoading(true);
      try {
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
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Botão de adicionar linha */}
      <div className="flex justify-end">
        <Button onClick={() => setIsAddingLine(true)} className="mb-4">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Linha de Produção
        </Button>
      </div>
      
      {study.productionLines.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Nenhuma linha de produção configurada</CardTitle>
            <CardDescription>
              Adicione uma linha de produção para começar a registrar postos de trabalho e atividades.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsAddingLine(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Linha
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {study.productionLines.map(line => (
            <AccordionLineItem 
              key={line.id}
              line={line}
              isExpanded={!!expandedLines[line.id]}
              onToggle={() => toggleLineExpansion(line.id)}
              onEdit={() => {
                setCurrentLine(line);
                setIsEditingLine(true);
              }}
              onDelete={handleDeleteLine}
              onAddWorkstation={() => {
                setCurrentLine(line);
                setIsAddingWorkstation(true);
              }}
              study={study}
              onStudyUpdate={onStudyUpdate}
              updateHistory={updateHistory}
            />
          ))}
        </div>
      )}

      {/* Dialog para adicionar linha */}
      <Dialog open={isAddingLine} onOpenChange={setIsAddingLine}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Linha de Produção</DialogTitle>
          </DialogHeader>
          <ProductionLineForm
            onSubmit={handleAddLine}
            onCancel={() => setIsAddingLine(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar posto de trabalho */}
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
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar linha */}
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
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar atividade */}
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
