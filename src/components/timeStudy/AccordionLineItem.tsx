
import React, { useState } from 'react';
import { ProductionLine, Workstation, TimeStudy } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { WorkstationList } from './WorkstationList';

interface AccordionLineItemProps {
  line: ProductionLine;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: (line: ProductionLine) => void;
  onDelete: (lineId: string, lineName: string) => void;
  onAddWorkstation: (line: ProductionLine) => void;
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
  study,
  onStudyUpdate,
  updateHistory
}: AccordionLineItemProps) {
  return (
    <Card 
      className="border-2 dark:border-primary/20 dark:bg-card/80 overflow-hidden transition-all duration-300"
    >
      <CardHeader className="bg-secondary/30 dark:bg-primary/10">
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>🏭 Linha: {line.name}</span>
            </CardTitle>
            {line.notes && <CardDescription>{line.notes}</CardDescription>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline" 
              size="icon"
              onClick={onToggle}
              className="dark:bg-primary/20 dark:hover:bg-primary/30"
              aria-label={isExpanded ? "Contrair linha" : "Expandir linha"}
              title={isExpanded ? "Contrair linha" : "Expandir linha"}
            >
              {isExpanded ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </Button>
            <Button
              variant="outline" 
              size="icon"
              onClick={() => onEdit(line)}
              className="dark:bg-primary/20 dark:hover:bg-primary/30"
              aria-label="Editar linha"
              title="Editar linha"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(line.id, line.name)}
              className="dark:bg-primary/20 dark:hover:bg-primary/30"
              aria-label="Excluir linha"
              title="Excluir linha"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 mt-2">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button 
                onClick={() => onAddWorkstation(line)}
                variant="outline"
                className="dark:bg-primary/20 dark:hover:bg-primary/30"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Posto de Trabalho
              </Button>
            </div>

            {line.workstations.length > 0 ? (
              <div className="pl-4 border-l-2 border-primary/20 dark:border-primary/40">
                <WorkstationList 
                  workstations={line.workstations}
                  lineId={line.id}
                  study={study}
                  onStudyUpdate={onStudyUpdate}
                  updateHistory={updateHistory}
                />
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhum posto de trabalho cadastrado
              </p>
            )}
          </div>
        </CardContent>
      )}
      
      {!isExpanded && line.workstations.length > 0 && (
        <div className="px-6 py-3 border-t dark:border-primary/10 text-sm text-muted-foreground">
          {line.workstations.length} posto(s) de trabalho • Clique no botão de expandir para visualizar
        </div>
      )}
    </Card>
  );
}
