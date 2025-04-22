
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Workstation } from '@/utils/types';
import { cn } from '@/lib/utils';

interface WorkstationListProps {
  workstations: Workstation[];
  onWorkstationClick?: (workstation: Workstation) => void;
}

export function WorkstationList({ workstations, onWorkstationClick }: WorkstationListProps) {
  // Sort workstations by position
  const sortedWorkstations = [...workstations].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {sortedWorkstations.map((workstation) => (
          <WorkstationBlock
            key={workstation.id}
            workstation={workstation}
            onClick={() => onWorkstationClick?.(workstation)}
          />
        ))}
      </div>
    </div>
  );
}

interface WorkstationBlockProps {
  workstation: Workstation;
  onClick?: () => void;
}

function WorkstationBlock({ workstation, onClick }: WorkstationBlockProps) {
  const statusClass = 
    workstation.status === 'bottleneck' ? 'workstation-block-bottleneck' :
    workstation.status === 'optimal' ? 'workstation-block-optimal' :
    workstation.status === 'warning' ? 'workstation-block-warning' : '';

  const statusText = 
    workstation.status === 'bottleneck' ? 'Gargalo' :
    workstation.status === 'optimal' ? 'Ótimo' :
    workstation.status === 'warning' ? 'Atenção' : 'Normal';

  return (
    <div 
      className={cn("workstation-block", statusClass)}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">{workstation.name}</h3>
          <p className="text-sm text-muted-foreground">
            Posição: {workstation.position}
          </p>
        </div>
        <Badge
          variant={
            workstation.status === 'bottleneck' ? 'destructive' :
            workstation.status === 'optimal' ? 'default' :
            workstation.status === 'warning' ? 'outline' : 'secondary'
          }
        >
          {statusText}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Tempo de Ciclo</p>
          <p className="text-sm font-medium">{workstation.cycleTime}s</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Eficiência</p>
          <p className="text-sm font-medium">{Math.round(workstation.efficiency * 100)}%</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium">Atividades:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          {workstation.activities.map((activity) => (
            <li key={activity.id} className="flex justify-between">
              <span>{activity.name}</span>
              <span>{activity.timeRequired}s</span>
            </li>
          ))}
        </ul>
      </div>

      {workstation.operatorId ? (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Operador:</p>
          <p className="text-sm">{workstation.operatorId}</p>
        </div>
      ) : (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Sem operador designado</p>
        </div>
      )}
    </div>
  );
}
