
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Atividade } from '@/pages/AnaliseAtividades';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AtividadesChartsProps {
  atividades: Atividade[];
  horasTrabalhadas: number;
}

export function AtividadesCharts({ atividades, horasTrabalhadas }: AtividadesChartsProps) {
  // Group activities by workstation and calculate sums
  const chartsData = useMemo(() => {
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

    // Calculate UPH and UPPH for each workstation
    postoMap.forEach((data) => {
      // UPH = 3600 / Tempo Total por Posto (seconds)
      data.uph = data.tempoTotal > 0 ? 3600 / data.tempoTotal : 0;
      
      // UPPH = UPH * Horas Trabalhadas
      data.upph = data.uph * horasTrabalhadas;
    });

    return Array.from(postoMap.values());
  }, [atividades, horasTrabalhadas]);

  // Detailed charts data with all activities per workstation
  const detailedChartsData = useMemo(() => {
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
  }, [atividades]);

  // Create chart config with dynamic colors for stack bars
  const chartConfig = useMemo(() => {
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
  }, [detailedChartsData]);

  if (atividades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráficos de Análise</CardTitle>
          <CardDescription>Não há dados suficientes para gerar gráficos</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-10 text-muted-foreground">
          Cadastre atividades para visualizar os gráficos de análise
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="tempo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tempo">Tempo por Posto</TabsTrigger>
          <TabsTrigger value="uph">UPH</TabsTrigger>
          <TabsTrigger value="upph">UPPH</TabsTrigger>
        </TabsList>
        
        {/* Tempo Total por Posto Chart */}
        <TabsContent value="tempo">
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
                    <BarChart data={detailedChartsData}>
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
        </TabsContent>
        
        {/* UPH Chart */}
        <TabsContent value="uph">
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
                  <BarChart data={chartsData}>
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
        </TabsContent>
        
        {/* UPPH Chart */}
        <TabsContent value="upph">
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
                  <LineChart data={chartsData}>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
