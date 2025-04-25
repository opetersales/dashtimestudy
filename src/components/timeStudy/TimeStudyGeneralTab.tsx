import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TimeStudy } from '@/utils/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShiftToggleList } from './ShiftToggleList';

interface TimeStudyGeneralTabProps {
  study: TimeStudy;
  onStudyUpdate: (study: TimeStudy) => void;
}

export function TimeStudyGeneralTab({ study, onStudyUpdate }: TimeStudyGeneralTabProps) {
  const handleShiftToggle = (shiftId: string, isActive: boolean) => {
    const updatedShifts = study.shifts.map(shift =>
      shift.id === shiftId ? { ...shift, isActive } : shift
    );
    
    onStudyUpdate({
      ...study,
      shifts: updatedShifts,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
          <CardDescription>Dados básicos do estudo de tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Cliente</dt>
              <dd className="mt-1 text-base">{study.client}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Modelo</dt>
              <dd className="mt-1 text-base">{study.modelName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Responsável</dt>
              <dd className="mt-1 text-base">{study.responsiblePerson}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Data do Estudo</dt>
              <dd className="mt-1 text-base">
                {format(new Date(study.studyDate), 'PPP', { locale: ptBR })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Demanda Mensal</dt>
              <dd className="mt-1 text-base">{study.monthlyDemand.toLocaleString()} unidades</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Dias Úteis</dt>
              <dd className="mt-1 text-base">{study.workingDays} dias</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Demanda Diária</dt>
              <dd className="mt-1 text-base">{study.dailyDemand?.toLocaleString() || 0} unidades</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1 capitalize">
                <span className="px-2 py-1 rounded-full text-xs bg-muted">
                  {study.status === 'draft' ? 'Rascunho' : 
                   study.status === 'active' ? 'Ativo' : 'Arquivado'}
                </span>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Turnos</CardTitle>
          <CardDescription>Gerencie os turnos de trabalho</CardDescription>
        </CardHeader>
        <CardContent>
          {study.shifts.length > 0 ? (
            <ShiftToggleList 
              shifts={study.shifts} 
              onShiftToggle={handleShiftToggle}
            />
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Nenhum turno configurado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
