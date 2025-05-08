
import React from 'react';
import { TimeStudy } from '@/utils/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useTimeStudyCalculations } from '@/shared/hooks/useTimeStudyCalculations';

interface MetricsCardProps {
  study: TimeStudy;
  taktTime: number;
  bottleneckUPH: number;
  totalDailyCapacity: number;
}

/**
 * Componente para exibição das métricas principais da linha
 */
export const MetricsCard: React.FC<MetricsCardProps> = ({ 
  study, 
  taktTime, 
  bottleneckUPH, 
  totalDailyCapacity 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas da Linha</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Takt Time</dt>
            <dd className="text-2xl font-bold">{taktTime > 0 ? `${taktTime.toFixed(2)}s` : 'N/D'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">UPH (Gargalo)</dt>
            <dd className="text-2xl font-bold">{bottleneckUPH} un/hora</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Capacidade Diária</dt>
            <dd className="text-2xl font-bold">{totalDailyCapacity} unidades</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Demanda Diária</dt>
            <dd className={`text-xl font-bold ${study.dailyDemand && totalDailyCapacity < study.dailyDemand ? 'text-red-600 dark:text-red-400' : ''}`}>
              {study.dailyDemand} unidades
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Atendimento de Demanda</dt>
            <dd className={`text-xl font-bold ${study.dailyDemand && totalDailyCapacity < study.dailyDemand ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {study.dailyDemand ? `${Math.round((totalDailyCapacity / study.dailyDemand) * 100)}%` : 'N/D'}
            </dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Exportar Métricas
        </Button>
      </CardFooter>
    </Card>
  );
};
