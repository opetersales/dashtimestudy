
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductionLineChart } from '@/components/charts/ProductionLineChart';
import { GboCard } from '@/components/gbo/GboCard';
import { generateMockGBOs, generatePerformanceData, GBO } from '@/utils/types';

export function Dashboard() {
  const [gbos] = React.useState<GBO[]>(generateMockGBOs(4));
  const [performanceData] = React.useState(generatePerformanceData());
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total de GBOs" 
          value="24" 
          description="7 ativos, 12 rascunhos, 5 arquivados"
          trend={8}
        />
        <MetricCard 
          title="Eficiência Média" 
          value="78%" 
          description="Melhora de 3% em relação ao mês anterior"
          trend={3}
        />
        <MetricCard 
          title="Gargalos Identificados" 
          value="5" 
          description="2 críticos, 3 moderados"
          trend={-2}
        />
        <MetricCard 
          title="Operadores Ativos" 
          value="32" 
          description="12 com certificação completa"
          trend={0}
        />
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="recent">GBOs Recentes</TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="space-y-4">
          <ProductionLineChart data={performanceData} />
        </TabsContent>
        <TabsContent value="recent">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {gbos.map((gbo) => (
              <GboCard key={gbo.id} gbo={gbo} />
            ))}
          </div>
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
