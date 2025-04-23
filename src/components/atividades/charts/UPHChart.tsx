
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData } from '@/types/atividades';

interface UPHChartProps {
  data: ChartData[];
}

export function UPHChart({ data }: UPHChartProps) {
  if (data.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Unidades por Hora (UPH)</CardTitle>
        <CardDescription>
          UPH = 3600 / Tempo Total por Posto (em segundos)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="posto" />
              <YAxis label={{ value: 'UPH', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => [value.toFixed(2), 'UPH']} />
              <Legend />
              <Bar 
                dataKey="uph" 
                name="Unidades por Hora" 
                fill="var(--primary)" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
