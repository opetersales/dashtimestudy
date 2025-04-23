
import { Atividade } from '@/types/atividades';

// Function to group activities by workstation
export const groupAtividadesByPosto = (atividades: Atividade[]) => {
  const postoMap = new Map<string, { 
    posto: string;
    tempoTotal: number;
    uph: number;
    upph: number;
  }>();

  atividades.forEach(atividade => {
    const existingPosto = postoMap.get(atividade.posto);
    const tempoAtividade = atividade.cycleTimeAjustado;
    
    if (existingPosto) {
      existingPosto.tempoTotal += tempoAtividade;
    } else {
      postoMap.set(atividade.posto, {
        posto: atividade.posto,
        tempoTotal: tempoAtividade,
        uph: 0, // Will calculate later
        upph: 0, // Will calculate later
      });
    }
  });

  return postoMap;
};

// Calculate UPH and UPPH
export const calculateUphMetrics = (postoMap: Map<string, any>, horasTrabalhadas: number) => {
  postoMap.forEach((data) => {
    // UPH = 3600 / Tempo Total por Posto (seconds)
    data.uph = data.tempoTotal > 0 ? 3600 / data.tempoTotal : 0;
    
    // UPPH = UPH * Horas Trabalhadas
    data.upph = data.uph * horasTrabalhadas;
  });

  return Array.from(postoMap.values());
};

// Function to generate detailed charts data
export const generateDetailedChartsData = (atividades: Atividade[]) => {
  const postoMapDetailed = new Map<string, {
    posto: string;
    atividades: {
      descricao: string;
      cycleTime: number;
      cycleTimeAjustado: number;
    }[];
  }>();

  atividades.forEach(atividade => {
    const existingPosto = postoMapDetailed.get(atividade.posto);
    
    if (existingPosto) {
      existingPosto.atividades.push({
        descricao: atividade.descricao,
        cycleTime: atividade.cycleTime,
        cycleTimeAjustado: atividade.cycleTimeAjustado,
      });
    } else {
      postoMapDetailed.set(atividade.posto, {
        posto: atividade.posto,
        atividades: [{
          descricao: atividade.descricao,
          cycleTime: atividade.cycleTime,
          cycleTimeAjustado: atividade.cycleTimeAjustado,
        }],
      });
    }
  });

  return Array.from(postoMapDetailed.values())
    .map(postoData => {
      // Create keys for each activity dynamically
      const activityData: Record<string, any> = { posto: postoData.posto };
      
      postoData.atividades.forEach((atividade, index) => {
        const safeKey = `a${index + 1}`;
        activityData[safeKey] = atividade.cycleTimeAjustado;
        activityData[`${safeKey}_name`] = atividade.descricao;
      });
      
      return activityData;
    });
};

// Function to create chart config with dynamic colors
export const createChartConfig = (detailedChartsData: Record<string, any>[]) => {
  const config: Record<string, any> = {};
  
  detailedChartsData.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key.startsWith('a') && !key.includes('_name')) {
        config[key] = {
          label: item[`${key}_name`],
          // Each activity gets a different color
          theme: {
            light: `hsl(${parseInt(key.substring(1)) * 30 % 360} 70% 50%)`,
            dark: `hsl(${parseInt(key.substring(1)) * 30 % 360} 70% 60%)`,
          },
        };
      }
    });
  });
  
  return config;
};
