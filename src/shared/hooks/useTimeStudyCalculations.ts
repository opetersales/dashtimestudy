
import { TimeStudy, Workstation, Activity, ProductionLine } from '@/utils/types';

/**
 * Hook para cálculos relacionados a estudos de tempo
 * Centraliza lógica de cálculo de UPH, tempo de ciclo, ociosidade e identificação de gargalos
 */
export function useTimeStudyCalculations() {
  /**
   * Calcula as métricas de produção para uma linha de produção
   * @param line Linha de produção
   * @returns Objeto com métricas calculadas
   */
  const calculateLineMetrics = (line: ProductionLine) => {
    let maxCycleTime = 0;
    let bottleneckWorkstation: Workstation | null = null;
    
    // Calcular tempos de ciclo para cada posto de trabalho
    const updatedWorkstations = line.workstations.map(ws => {
      const cycleTime = calculateWorkstationCycleTime(ws);
      
      if (cycleTime > maxCycleTime) {
        maxCycleTime = cycleTime;
        bottleneckWorkstation = ws;
      }
      
      const uph = cycleTime > 0 ? Math.floor(3600 / cycleTime) : 0;
      
      return {
        ...ws,
        cycleTime,
        uph
      };
    });
    
    // Calcular UPH da linha baseado no gargalo
    const lineUPH = maxCycleTime > 0 ? Math.floor(3600 / maxCycleTime) : 0;
    
    return {
      updatedWorkstations,
      lineUPH,
      lineCycleTime: maxCycleTime,
      bottleneckWorkstation
    };
  };
  
  /**
   * Calcula o tempo de ciclo para um posto de trabalho
   * @param workstation Posto de trabalho
   * @returns Tempo de ciclo em segundos
   */
  const calculateWorkstationCycleTime = (workstation: Workstation): number => {
    let totalCycleTime = 0;
    
    workstation.activities.forEach(activity => {
      const activityCycleTime = calculateActivityCycleTime(activity);
      totalCycleTime += activityCycleTime;
    });
    
    return totalCycleTime;
  };
  
  /**
   * Calcula o tempo de ciclo para uma atividade
   * @param activity Atividade
   * @returns Tempo de ciclo em segundos
   */
  const calculateActivityCycleTime = (activity: Activity): number => {
    // Filtrar coleções com valores válidos
    const validCollections = activity.collections.filter(c => 
      typeof c === 'object' ? c.value > 0 : c > 0
    );
    
    if (validCollections.length === 0) return 0;
    
    // Calcular tempo médio normal
    const avgNormalTime = validCollections.reduce((sum, c) => {
      const value = typeof c === 'object' ? c.value : c;
      return sum + value;
    }, 0) / validCollections.length;
    
    // Aplicar fator PF&D
    const cycleTime = avgNormalTime * (1 + activity.pfdFactor);
    
    return cycleTime;
  };
  
  /**
   * Calcula o takt time para o estudo completo
   * @param study Estudo de tempo
   * @returns Takt time em segundos
   */
  const calculateTaktTime = (study: TimeStudy): number => {
    if (!study.dailyDemand || study.dailyDemand <= 0) return 0;
    
    const activeShifts = study.shifts.filter(s => s.isActive);
    if (activeShifts.length === 0) return 0;
    
    const totalShiftSeconds = activeShifts.reduce((sum, s) => sum + (s.hours * 3600), 0);
    return totalShiftSeconds / study.dailyDemand;
  };
  
  /**
   * Calcula a ociosidade para todos os postos, baseado no tempo de ciclo do gargalo
   * @param workstations Lista de postos de trabalho
   * @param maxCycleTime Tempo de ciclo do posto gargalo
   * @returns Lista atualizada com métricas de ociosidade
   */
  const calculateIdleTimes = (workstations: Workstation[], maxCycleTime: number) => {
    if (maxCycleTime <= 0) return workstations;
    
    return workstations.map(ws => {
      const cycleTime = ws.cycleTime || 0;
      const idleTime = ((maxCycleTime - cycleTime) / maxCycleTime) * 100;
      const isCritical = cycleTime >= maxCycleTime * 0.95;
      
      let status: 'bottleneck' | 'optimal' | 'warning' | 'normal' = 'normal';
      
      if (cycleTime >= maxCycleTime) {
        status = 'bottleneck';
      } else if (idleTime <= 10) {
        status = 'optimal';
      } else if (idleTime >= 30) {
        status = 'warning';
      }
      
      return {
        ...ws,
        idleTime,
        status,
        isCritical
      };
    });
  };
  
  /**
   * Calcula a distribuição de tempo entre atividades manuais e de maquinário
   * @param workstations Lista de postos de trabalho
   * @returns Objeto com tempos totais por tipo
   */
  const calculateActivityTypeDistribution = (workstations: Workstation[]) => {
    let manualTimeTotal = 0;
    let machineTimeTotal = 0;
    
    workstations.forEach(ws => {
      ws.activities.forEach(act => {
        const actCycleTime = calculateActivityCycleTime(act);
        
        if (act.type === 'Manual') {
          manualTimeTotal += actCycleTime;
        } else {
          machineTimeTotal += actCycleTime;
        }
      });
    });
    
    return {
      manual: manualTimeTotal,
      machine: machineTimeTotal,
      total: manualTimeTotal + machineTimeTotal
    };
  };
  
  /**
   * Calcula métricas gerais para um estudo completo
   * @param study Estudo de tempo
   * @returns Objeto com todas as métricas calculadas
   */
  const calculateStudyMetrics = (study: TimeStudy) => {
    if (!study || study.productionLines.length === 0) {
      return { 
        taktTime: 0, 
        bottleneckUPH: 0, 
        totalDailyCapacity: 0,
        alertMessages: [],
        updatedStudy: study
      };
    }
    
    // Clone o estudo para não modificar o original
    const updatedStudy = { ...study };
    const alerts: string[] = [];
    
    // Takt time
    const taktTime = calculateTaktTime(study);
    
    // Métricas por linha de produção
    let minLineUPH = Infinity;
    
    updatedStudy.productionLines = study.productionLines.map(line => {
      const { updatedWorkstations, lineUPH, lineCycleTime } = calculateLineMetrics(line);
      
      // Atualizar workstations com ociosidade
      const workstationsWithIdle = calculateIdleTimes(updatedWorkstations, lineCycleTime);
      
      if (lineUPH < minLineUPH) {
        minLineUPH = lineUPH;
      }
      
      return {
        ...line,
        workstations: workstationsWithIdle,
        cycleTime: lineCycleTime,
        uph: lineUPH
      };
    });
    
    // Não pode ser infinito
    const bottleneckUPH = minLineUPH === Infinity ? 0 : minLineUPH;
    
    // Calcular capacidade diária total
    let totalProduction = 0;
    const shiftProduction = study.shifts
      .filter(s => s.isActive)
      .map(shift => {
        const production = Math.floor(bottleneckUPH * shift.hours);
        totalProduction += production;
        
        return {
          ...shift,
          production,
          taktTime: shift.hours > 0 && study.dailyDemand 
            ? (shift.hours * 3600) / study.dailyDemand 
            : 0
        };
      });
    
    // Atualizar shifts com produção
    updatedStudy.shifts = shiftProduction;
    
    // Gerar alertas
    if (taktTime > 0) {
      const maxCycleTime = Math.max(...updatedStudy.productionLines.map(l => l.cycleTime || 0));
      
      if (maxCycleTime > taktTime) {
        alerts.push(`ALERTA: O tempo de ciclo (${maxCycleTime.toFixed(2)}s) é maior que o takt time (${taktTime.toFixed(2)}s). A linha não conseguirá atender a demanda.`);
      }
      
      if (study.dailyDemand && totalProduction < study.dailyDemand) {
        alerts.push(`ALERTA: A capacidade diária estimada (${totalProduction} un) é menor que a demanda diária (${study.dailyDemand} un). Considere ajustes na linha.`);
      }
    }
    
    // Verificar postos com alta ociosidade
    const idleWorkstations = updatedStudy.productionLines.flatMap(line => 
      line.workstations.filter(ws => (ws.idleTime || 0) > 30)
    );
    
    idleWorkstations.forEach(ws => {
      alerts.push(`O posto "${ws.number}${ws.name ? ' - ' + ws.name : ''}" tem ociosidade de ${ws.idleTime?.toFixed(1)}% e pode ser otimizado.`);
    });
    
    return {
      taktTime,
      bottleneckUPH,
      totalDailyCapacity: totalProduction,
      alertMessages: alerts,
      updatedStudy
    };
  };

  return {
    calculateLineMetrics,
    calculateWorkstationCycleTime,
    calculateActivityCycleTime,
    calculateTaktTime,
    calculateIdleTimes,
    calculateActivityTypeDistribution,
    calculateStudyMetrics
  };
}
