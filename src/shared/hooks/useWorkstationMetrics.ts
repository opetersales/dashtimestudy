
import { Workstation, Activity } from '@/utils/types';

/**
 * Interface para métricas de posto de trabalho
 */
export interface WorkstationMetric {
  name: string;
  cycleTime: number;
  uph: number;
  idleTime: number;
  isCritical: boolean;
}

/**
 * Hook para análise específica de métricas por posto de trabalho
 */
export function useWorkstationMetrics() {
  /**
   * Gera métricas para um posto de trabalho
   * @param workstation Posto de trabalho
   * @param bottleneckCycleTime Tempo de ciclo do posto gargalo (para cálculo de ociosidade)
   * @returns Métricas do posto
   */
  const getWorkstationMetrics = (
    workstation: Workstation, 
    bottleneckCycleTime: number = 0
  ): WorkstationMetric => {
    const cycleTime = workstation.cycleTime || calculateWorkstationCycleTime(workstation);
    const uph = cycleTime > 0 ? Math.floor(3600 / cycleTime) : 0;
    
    // Se não temos um gargalo definido, consideramos que não há ociosidade
    let idleTime = 0;
    let isCritical = false;
    
    if (bottleneckCycleTime > 0) {
      idleTime = ((bottleneckCycleTime - cycleTime) / bottleneckCycleTime) * 100;
      isCritical = cycleTime >= bottleneckCycleTime * 0.95;
    }
    
    return {
      name: `Posto ${workstation.number}${workstation.name ? ' - ' + workstation.name : ''}`,
      cycleTime,
      uph,
      idleTime,
      isCritical
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
   * Analisa todos os postos em uma lista e retorna suas métricas
   * @param workstations Lista de postos de trabalho
   * @returns Lista de métricas por posto
   */
  const analyzeWorkstations = (workstations: Workstation[]): WorkstationMetric[] => {
    if (!workstations.length) return [];
    
    // Encontrar o tempo de ciclo do gargalo
    const bottleneckCycleTime = Math.max(
      ...workstations.map(ws => ws.cycleTime || calculateWorkstationCycleTime(ws))
    );
    
    // Gerar métricas para cada posto
    return workstations.map(ws => getWorkstationMetrics(ws, bottleneckCycleTime));
  };
  
  /**
   * Gera sugestões para balanceamento de linha baseado nas métricas dos postos
   * @param workstationMetrics Métricas dos postos de trabalho
   * @returns Lista de sugestões por posto
   */
  const generateBalancingSuggestions = (workstationMetrics: WorkstationMetric[]) => {
    return workstationMetrics.map(ws => {
      let suggestion = '';
      
      if (ws.isCritical) {
        suggestion = 'Posto gargalo - considere redistribuir atividades';
      } else if (ws.idleTime > 30) {
        suggestion = 'Alta ociosidade - considere adicionar atividades';
      } else if (ws.idleTime < 10) {
        suggestion = 'Balanceado - próximo do ideal';
      } else {
        suggestion = 'Balanceado';
      }
      
      return {
        ...ws,
        suggestion,
        status: ws.isCritical ? 'bottleneck' : ws.idleTime > 30 ? 'warning' : 'normal'
      };
    });
  };

  return {
    getWorkstationMetrics,
    calculateWorkstationCycleTime,
    calculateActivityCycleTime,
    analyzeWorkstations,
    generateBalancingSuggestions
  };
}
