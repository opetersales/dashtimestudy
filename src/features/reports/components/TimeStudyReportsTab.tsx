
import React, { useEffect, useState } from 'react';
import { TimeStudy } from '@/utils/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTimeStudyCalculations } from '@/shared/hooks/useTimeStudyCalculations';
import { useWorkstationMetrics, WorkstationMetric } from '@/shared/hooks/useWorkstationMetrics';
import { MetricsCard } from './MetricsCard';
import { CycleTimeChart } from './CycleTimeChart';
import { ActivityDistributionChart } from './ActivityDistributionChart';
import { UphLineChart } from './UphLineChart';
import { BalancingTable } from './BalancingTable';
import { AlertMessages } from './AlertMessages';

interface TimeStudyReportsTabProps {
  study: TimeStudy;
}

interface ActivityTypeMetric {
  name: string;
  value: number;
}

/**
 * Aba de relatórios do estudo de tempo
 * Exibe visualizações e métricas calculadas
 */
export function TimeStudyReportsTab({ study }: TimeStudyReportsTabProps) {
  // Hooks para cálculos
  const { calculateStudyMetrics, calculateActivityTypeDistribution } = useTimeStudyCalculations();
  const { analyzeWorkstations } = useWorkstationMetrics();
  
  // Estado local para métricas calculadas
  const [workstationMetrics, setWorkstationMetrics] = useState<WorkstationMetric[]>([]);
  const [activityTypeMetrics, setActivityTypeMetrics] = useState<ActivityTypeMetric[]>([]);
  const [taktTime, setTaktTime] = useState<number>(0);
  const [bottleneckUPH, setBottleneckUPH] = useState<number>(0);
  const [totalDailyCapacity, setTotalDailyCapacity] = useState<number>(0);
  const [alertMessages, setAlertMessages] = useState<string[]>([]);

  // Calcular métricas quando o estudo muda
  useEffect(() => {
    if (study.productionLines.length === 0) return;

    // Calcular métricas gerais do estudo
    const { 
      taktTime,
      bottleneckUPH,
      totalDailyCapacity,
      alertMessages
    } = calculateStudyMetrics(study);
    
    // Consolidar todos os postos de trabalho
    const allWorkstations = study.productionLines.flatMap(line => line.workstations);
    
    // Analisar métricas por posto
    const wsMetrics = analyzeWorkstations(allWorkstations);
    
    // Calcular distribuição por tipo de atividade
    const typeDistribution = calculateActivityTypeDistribution(allWorkstations);
    const typeMetrics = [
      { name: 'Manual', value: typeDistribution.manual },
      { name: 'Maquinário', value: typeDistribution.machine }
    ];
    
    // Atualizar estado
    setWorkstationMetrics(wsMetrics);
    setActivityTypeMetrics(typeMetrics);
    setTaktTime(taktTime);
    setBottleneckUPH(bottleneckUPH);
    setTotalDailyCapacity(totalDailyCapacity);
    setAlertMessages(alertMessages || []);
    
  }, [study, calculateStudyMetrics, calculateActivityTypeDistribution, analyzeWorkstations]);

  // Mostrar mensagem quando não houver linhas cadastradas
  if (study.productionLines.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertTitle>Nenhuma linha cadastrada</AlertTitle>
        <AlertDescription>
          Adicione ao menos uma linha de produção com postos de trabalho e atividades para visualizar os relatórios.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Exibir alertas */}
      <AlertMessages messages={alertMessages} />

      {/* Primeira linha: Métricas gerais e gráfico de tempo de ciclo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MetricsCard
          study={study}
          taktTime={taktTime}
          bottleneckUPH={bottleneckUPH}
          totalDailyCapacity={totalDailyCapacity}
        />
        <CycleTimeChart workstationMetrics={workstationMetrics} />
      </div>

      {/* Segunda linha: Distribuição de tempo e gráfico de UPH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActivityDistributionChart activityTypeMetrics={activityTypeMetrics} />
        <UphLineChart 
          workstationMetrics={workstationMetrics}
          bottleneckUPH={bottleneckUPH}
        />
      </div>

      {/* Terceira linha: Tabela de balanceamento */}
      <BalancingTable workstationMetrics={workstationMetrics} />
    </div>
  );
}
