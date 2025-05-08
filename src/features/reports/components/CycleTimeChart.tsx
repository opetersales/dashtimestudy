
import React from 'react';
import { WorkstationMetric } from '@/shared/hooks/useWorkstationMetrics';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface CycleTimeChartProps {
  workstationMetrics: WorkstationMetric[];
}

/**
 * Componente para visualização gráfica do tempo de ciclo por posto
 */
export const CycleTimeChart: React.FC<CycleTimeChartProps> = ({ workstationMetrics }) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Cycle Time por Posto</CardTitle>
        <CardDescription>Comparativo de tempo de ciclo por posto de trabalho</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={workstationMetrics}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis unit="s" />
            <Tooltip formatter={(value) => `${Number(value).toFixed(2)}s`} />
            <Legend />
            <Bar 
              dataKey="cycleTime" 
              name="Cycle Time (s)" 
              fill="#8884d8" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
