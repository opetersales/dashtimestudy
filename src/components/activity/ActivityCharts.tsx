
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ChartDataItem {
  station: string;
  totalTime: number;
  adjustedTime: number;
}

interface UphDataItem {
  station: string;
  uph: number;
}

interface UpphDataItem {
  station: string;
  upph: number;
}

interface ActivityChartsProps {
  chartData: {
    stationData: ChartDataItem[];
    uphData: UphDataItem[];
    upphData: UpphDataItem[];
  };
}

export const ActivityCharts: React.FC<ActivityChartsProps> = ({ chartData }) => {
  const { stationData, uphData, upphData } = chartData;

  // Format data for stacked bar chart
  const formattedStationData = stationData.map(item => ({
    station: item.station,
    'Tempo Base': parseFloat(item.totalTime.toFixed(1)),
    'Tempo com Fadiga': parseFloat((item.adjustedTime - item.totalTime).toFixed(1)),
  }));

  // Format data for UPH chart
  const formattedUphData = uphData.map(item => ({
    station: item.station,
    UPH: parseFloat(item.uph.toFixed(1)),
  }));

  // Format data for UPPH chart
  const formattedUpphData = upphData.map(item => ({
    station: item.station,
    UPPH: parseFloat(item.upph.toFixed(1)),
  }));

  return (
    <Tabs defaultValue="time" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="time">Tempo por Posto</TabsTrigger>
        <TabsTrigger value="uph">UPH</TabsTrigger>
        <TabsTrigger value="upph">UPPH</TabsTrigger>
      </TabsList>
      
      <TabsContent value="time" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tempo Total por Posto</CardTitle>
            <CardDescription>
              Tempo base e adicional devido à fadiga (em segundos)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formattedStationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} s`} />
                  <Legend />
                  <Bar dataKey="Tempo Base" stackId="a" fill="#4f46e5" />
                  <Bar dataKey="Tempo com Fadiga" stackId="a" fill="#818cf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="uph" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Unidades por Hora (UPH)</CardTitle>
            <CardDescription>
              Cálculo: 3600 / tempo total por posto
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formattedUphData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} unidades/hora`} />
                  <Legend />
                  <Bar dataKey="UPH" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="upph" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Unidades por Pessoa por Hora (UPPH)</CardTitle>
            <CardDescription>
              Cálculo: UPH × Horas Trabalhadas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={formattedUpphData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} unidades/pessoa/hora`} />
                  <Legend />
                  <Bar dataKey="UPPH" fill="#0891b2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
