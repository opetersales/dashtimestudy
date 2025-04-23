
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GBO } from '@/utils/types';
import { Atividade } from '@/types/atividades';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { EmptyChart } from '@/components/atividades/charts/EmptyChart';

interface GboDashboardProps {
  gbo: GBO;
  atividades: Atividade[];
}

export function GboDashboard({ gbo, atividades }: GboDashboardProps) {
  // Preparar dados para gráficos
  const postosData = React.useMemo(() => {
    if (atividades.length === 0) return [];
    
    const postoMap = new Map<string, {
      tempoTotal: number;
      count: number;
      atividades: string[];
      tempoMaximo: number;
    }>();
    
    // Agrupar atividades por posto
    atividades.forEach((atividade) => {
      const posto = postoMap.get(atividade.posto) || { 
        tempoTotal: 0, 
        count: 0, 
        atividades: [], 
        tempoMaximo: 0 
      };
      
      posto.tempoTotal += atividade.cycleTimeAjustado;
      posto.count += 1;
      posto.atividades.push(atividade.descricao);
      posto.tempoMaximo = Math.max(posto.tempoMaximo, atividade.cycleTimeAjustado);
      
      postoMap.set(atividade.posto, posto);
    });
    
    // Transformar o mapa em array para o gráfico
    return Array.from(postoMap.entries()).map(([posto, data]) => ({
      posto,
      tempoTotal: data.tempoTotal,
      tempoMedio: data.tempoTotal / data.count,
      tempoMaximo: data.tempoMaximo,
      quantidadeAtividades: data.count,
      atividades: data.atividades.join(", "),
    }));
  }, [atividades]);
  
  // Calcular métricas
  const tempoTotal = postosData.reduce((sum, posto) => sum + posto.tempoTotal, 0);
  const postoMaisLento = postosData.length > 0 
    ? postosData.reduce((max, posto) => posto.tempoTotal > max.tempoTotal ? posto : max, postosData[0]).posto
    : "N/A";
  const tempoMedio = atividades.length > 0
    ? atividades.reduce((sum, a) => sum + a.cycleTimeAjustado, 0) / atividades.length
    : 0;
  
  // Calcular UPH baseado no posto mais lento
  const tempoMaisLongo = postosData.length > 0 
    ? Math.max(...postosData.map(p => p.tempoTotal))
    : 0;
  const uphCalculado = tempoMaisLongo > 0 
    ? Math.floor(3600 / tempoMaisLongo)
    : 0;
  
  // Determinar se o UPH calculado é melhor ou pior que o alvo
  const uphDiff = gbo.targetUPH > 0 
    ? ((uphCalculado - gbo.targetUPH) / gbo.targetUPH * 100).toFixed(1)
    : "0";
  
  const balanceamentoData = React.useMemo(() => {
    if (postosData.length === 0) return [];
    
    // Calcular tempo de ciclo teórico (o maior tempo)
    const tempoCicloTeorico = Math.max(...postosData.map(p => p.tempoTotal));
    
    // Para cada posto, calcular a eficiência de balanceamento
    return postosData.map(posto => ({
      posto: posto.posto,
      tempoTotal: posto.tempoTotal,
      eficiencia: (posto.tempoTotal / tempoCicloTeorico * 100).toFixed(1),
      meta: 100 // Meta é sempre 100% (ideal)
    }));
  }, [postosData]);

  if (atividades.length === 0) {
    return (
      <EmptyChart />
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Tempo Total" 
          value={`${tempoTotal.toFixed(1)}s`}
          description={`${atividades.length} atividades em ${postosData.length} postos`}
        />
        <MetricCard 
          title="Posto Crítico" 
          value={postoMaisLento}
          description="Posto com maior tempo de ciclo"
        />
        <MetricCard 
          title="UPH Calculado" 
          value={uphCalculado.toString()}
          description={`${uphDiff}% em relação à meta (${gbo.targetUPH})`}
          trend={Number(uphDiff)}
        />
        <MetricCard 
          title="Tempo Médio" 
          value={`${tempoMedio.toFixed(1)}s`}
          description="Média de tempo por atividade"
        />
      </div>
      
      <Tabs defaultValue="tempos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tempos">Tempos por Posto</TabsTrigger>
          <TabsTrigger value="balanceamento">Balanceamento de Linha</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tempos">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Tempos por Posto</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={postosData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="posto" angle={-45} textAnchor="end" height={70} />
                    <YAxis label={{ value: 'Tempo (s)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value}s`]} />
                    <Legend />
                    <Bar dataKey="tempoTotal" name="Tempo Total" fill="#8884d8" />
                    <Bar dataKey="tempoMaximo" name="Tempo Máximo" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="balanceamento">
          <Card>
            <CardHeader>
              <CardTitle>Balanceamento de Linha</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={balanceamentoData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="posto" angle={-45} textAnchor="end" height={70} />
                    <YAxis label={{ value: 'Eficiência (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="eficiencia" name="% Balanceamento" stroke="#8884d8" />
                    <Line type="monotone" dataKey="meta" name="Meta" stroke="#ff7300" strokeDasharray="5 5" />
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

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  trend?: number;
}

function MetricCard({ title, value, description, trend }: MetricCardProps) {
  const trendIndicator = trend === undefined ? '' :
    trend > 0 ? 'indicator-up' :
    trend < 0 ? 'indicator-down' :
    'indicator-neutral';

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend !== undefined && (
          <p className={`text-xs mt-2 ${trendIndicator}`}>
            {trend > 0 ? '+' : ''}{trend}% em relação à meta
          </p>
        )}
      </CardContent>
    </Card>
  );
}
