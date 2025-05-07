
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface TempoTotalChartProps {
  detailedData: Record<string, any>[];
  chartConfig: Record<string, any>;
}

export function TempoTotalChart({ detailedData, chartConfig }: TempoTotalChartProps) {
  if (detailedData.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tempo Total por Posto</CardTitle>
        <CardDescription>
          Visualização dos tempos por posto de trabalho, com detalhamento por atividade
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={detailedData}
                margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="posto" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ 
                    value: 'Segundos', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' } 
                  }}
                />
                <Tooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => {
                    // Format the value to show with two decimal places
                    const displayValue = Number(value).toFixed(2);
                    const activityName = chartConfig[name]?.label || name;
                    return [`${displayValue}s`, activityName];
                  }}
                />
                <Legend content={<ChartLegendContent />} />
                {Object.keys(chartConfig).map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={chartConfig[key].label}
                    stackId="a"
                    fill={`var(--color-${key})`}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
