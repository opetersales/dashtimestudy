
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

interface TimeStudyGeneralTabProps {
  study: TimeStudy;
}

export function TimeStudyGeneralTab({ study }: TimeStudyGeneralTabProps) {
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
          <CardTitle>Turnos Configurados</CardTitle>
          <CardDescription>Informações sobre os turnos de trabalho</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {study.shifts.map((shift) => (
              <div key={shift.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{shift.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${shift.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {shift.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="mt-2">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">Horas Trabalhadas</dt>
                      <dd>{shift.hours} horas</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Takt Time</dt>
                      <dd>{shift.taktTime ? `${shift.taktTime.toFixed(2)} seg` : 'Não calculado'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Produção Estimada</dt>
                      <dd>{shift.estimatedProduction ? shift.estimatedProduction.toLocaleString() : 'Não calculado'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            ))}
            
            {study.shifts.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhum turno configurado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
