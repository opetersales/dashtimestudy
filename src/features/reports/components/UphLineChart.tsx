
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface UphLineChartProps {
  workstationMetrics: WorkstationMetric[];
  bottleneckUPH: number;
}

/**
 * Componente para visualização gráfica de UPH por posto de trabalho
 */
export const UphLineChart: React.FC<UphLineChartProps> = ({ 
  workstationMetrics,
  bottleneckUPH
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>UPH por Posto de Trabalho</CardTitle>
        <CardDescription>Unidades por hora em cada posto</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={workstationMetrics}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="uph" 
              name="UPH" 
              stroke="#82ca9d" 
              activeDot={{ r: 8 }}
            />
            {bottleneckUPH > 0 && (
              <Line
                type="monotone"
                dataKey={() => bottleneckUPH}
                name="UPH Gargalo"
                stroke="#ff7300"
                strokeDasharray="5 5"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
