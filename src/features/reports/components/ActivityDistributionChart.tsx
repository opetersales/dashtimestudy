
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

interface ActivityTypeMetric {
  name: string;
  value: number;
}

interface ActivityDistributionChartProps {
  activityTypeMetrics: ActivityTypeMetric[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

/**
 * Componente para visualização da distribuição de tempos por tipo de atividade
 */
export const ActivityDistributionChart: React.FC<ActivityDistributionChartProps> = ({ 
  activityTypeMetrics 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Tempo por Tipo</CardTitle>
        <CardDescription>Manual vs. Maquinário</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={activityTypeMetrics}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {activityTypeMetrics.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `${Number(value).toFixed(2)}s`}
              labelFormatter={(_, payload) => payload[0]?.name || ""}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
