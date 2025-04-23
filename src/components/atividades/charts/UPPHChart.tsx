
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData } from '@/types/atividades';

interface UPPHChartProps {
  data: ChartData[];
  horasTrabalhadas: number;
}

export function UPPHChart({ data, horasTrabalhadas }: UPPHChartProps) {
  if (data.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Unidades por Pessoa por Hora (UPPH)</CardTitle>
        <CardDescription>
          UPPH = UPH × Horas Trabalhadas ({horasTrabalhadas} horas)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="posto" />
              <YAxis label={{ value: 'UPPH', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => [value.toFixed(2), 'UPPH']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="upph" 
                name="Unidades por Pessoa por Hora" 
                stroke="var(--primary)" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
