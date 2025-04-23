
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { loadFromLocalStorage } from '@/services/localStorage';
import { GBO } from '@/utils/types';

interface PerformanceData {
  label: string;
  actual: number;
  target: number;
}

export function Dashboard() {
  // Carregar GBOs do localStorage
  const gbos = loadFromLocalStorage<GBO[]>('gboList', []);
  const activeGbos = gbos.filter(gbo => gbo.status === 'active');
  const draftGbos = gbos.filter(gbo => gbo.status === 'draft');
  const archivedGbos = gbos.filter(gbo => gbo.status === 'archived');
  
  // Gerar dados de desempenho com base nas GBOs
  const performanceData = React.useMemo(() => {
    // Usar os dados dos GBOs para gerar informações de desempenho
    return gbos.slice(0, 7).map(gbo => ({
      label: gbo.name,
      actual: gbo.actualUPH,
      target: gbo.targetUPH
    }));
  }, [gbos]);
  
  // Gerar dados de eficiência
  const efficiencyData = React.useMemo(() => {
    return gbos.slice(0, 7).map(gbo => ({
      label: gbo.name,
      value: Math.round(gbo.efficiency * 100)
    }));
  }, [gbos]);

  // Calcular métricas gerais
  const totalOperators = activeGbos.reduce((sum, gbo) => sum + gbo.operatorCount, 0);
  const avgEfficiency = gbos.length > 0 
    ? gbos.reduce((sum, gbo) => sum + gbo.efficiency, 0) / gbos.length
    : 0;
  
  // Identificar gargalos (postos de trabalho com eficiência baixa)
  const bottlenecks = activeGbos.length > 0 
    ? Math.floor(activeGbos.length * 0.2) + 1 // Simular ~20% dos GBOs com gargalos
    : 0;
  
  // Calcular tendência de eficiência (simulada)
  const efficiencyTrend = (Math.random() * 8 - 4).toFixed(1);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total de GBOs" 
          value={gbos.length.toString()} 
          description={`${activeGbos.length} ativos, ${draftGbos.length} rascunhos, ${archivedGbos.length} arquivados`}
          trend={Math.round((gbos.length - 20) / 20 * 100)} // Simulando tendência
        />
        <MetricCard 
          title="Eficiência Média" 
          value={`${Math.round(avgEfficiency * 100)}%`} 
          description="Baseado em todos os GBOs ativos"
          trend={Number(efficiencyTrend)}
        />
        <MetricCard 
          title="Gargalos Identificados" 
          value={bottlenecks.toString()} 
          description={`${Math.ceil(bottlenecks / 3)} críticos, ${bottlenecks - Math.ceil(bottlenecks / 3)} moderados`}
          trend={-2}
        />
        <MetricCard 
          title="Operadores Ativos" 
          value={totalOperators.toString()} 
          description={`${Math.floor(totalOperators * 0.4)} com certificação completa`}
          trend={Math.round(Math.random() * 6 - 3)}
        />
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Desempenho GBOs</TabsTrigger>
          <TabsTrigger value="efficiency">Eficiência GBOs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho UPH por GBO</CardTitle>
              <CardDescription>Comparação entre UPH alvo e UPH atual por GBO</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="target" name="UPH Alvo" fill="#8884d8" />
                  <Bar dataKey="actual" name="UPH Atual" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="efficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eficiência por GBO</CardTitle>
              <CardDescription>Porcentagem de eficiência para cada GBO</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="Eficiência (%)" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
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
  trend: number;
}

function MetricCard({ title, value, description, trend }: MetricCardProps) {
  const trendIndicator = 
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
        {trend !== 0 && (
          <p className={`text-xs mt-2 ${trendIndicator}`}>
            {trend > 0 ? '+' : ''}{trend}% desde o último período
          </p>
        )}
      </CardContent>
    </Card>
  );
}
