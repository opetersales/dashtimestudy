
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
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
              <BarChart data={detailedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="posto" />
                <YAxis label={{ value: 'Segundos', angle: -90, position: 'insideLeft' }} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
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
