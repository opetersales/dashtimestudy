
import React, { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Atividade } from '@/types/atividades';
import { 
  groupAtividadesByPosto, 
  calculateUphMetrics, 
  generateDetailedChartsData, 
  createChartConfig 
} from '@/services/chartUtils';
import { EmptyChart } from './charts/EmptyChart';
import { TempoTotalChart } from './charts/TempoTotalChart';
import { UPHChart } from './charts/UPHChart';
import { UPPHChart } from './charts/UPPHChart';

interface AtividadesChartsProps {
  atividades: Atividade[];
  horasTrabalhadas: number;
}

export function AtividadesCharts({ atividades, horasTrabalhadas }: AtividadesChartsProps) {
  // Group activities by workstation and calculate metrics
  const chartsData = useMemo(() => {
    const postoMap = groupAtividadesByPosto(atividades);
    return calculateUphMetrics(postoMap, horasTrabalhadas);
  }, [atividades, horasTrabalhadas]);

  // Detailed charts data with all activities per workstation
  const detailedChartsData = useMemo(() => 
    generateDetailedChartsData(atividades), [atividades]);

  // Create chart config with dynamic colors for stack bars
  const chartConfig = useMemo(() => 
    createChartConfig(detailedChartsData), [detailedChartsData]);

  if (atividades.length === 0) {
    return <EmptyChart />;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="tempo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tempo">Tempo por Posto</TabsTrigger>
          <TabsTrigger value="uph">UPH</TabsTrigger>
          <TabsTrigger value="upph">UPPH</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tempo">
          <TempoTotalChart 
            detailedData={detailedChartsData}
            chartConfig={chartConfig}
          />
        </TabsContent>
        
        <TabsContent value="uph">
          <UPHChart data={chartsData} />
        </TabsContent>
        
        <TabsContent value="upph">
          <UPPHChart 
            data={chartsData} 
            horasTrabalhadas={horasTrabalhadas} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
