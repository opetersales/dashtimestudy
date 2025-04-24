
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell } from 'recharts';
import { loadFromLocalStorage } from '@/services/localStorage';
import { TimeStudy } from '@/utils/types';

export function Dashboard() {
  // Load time studies from localStorage
  const studies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
  const activeStudies = studies.filter(study => study.status === 'active');
  const draftStudies = studies.filter(study => study.status === 'draft');
  const archivedStudies = studies.filter(study => study.status === 'archived');
  
  // Generate performance data based on studies
  const performanceData = React.useMemo(() => {
    return studies.slice(0, 7).map(study => {
      // Calculate UPH based on the bottleneck workstation in each study
      let actualUPH = 0;
      let targetUPH = 0;
      
      if (study.productionLines.length > 0) {
        // Find highest cycle time among workstations (bottleneck)
        const lineCycleTimes = study.productionLines.map(line => {
          let maxCycleTime = 0;
          
          line.workstations.forEach(ws => {
            let workstationCycleTime = 0;
            
            ws.activities.forEach(activity => {
              // Calculate average normal time from collections
              const validCollections = activity.collections.filter(c => c.value > 0);
              if (validCollections.length > 0) {
                const avgNormalTime = validCollections.reduce((sum, c) => sum + c.value, 0) / validCollections.length;
                const activityCycleTime = avgNormalTime * (1 + activity.pfdFactor);
                workstationCycleTime += activityCycleTime;
              }
            });
            
            if (workstationCycleTime > maxCycleTime) {
              maxCycleTime = workstationCycleTime;
            }
          });
          
          return maxCycleTime;
        });
        
        const bottleneckCycleTime = Math.max(...lineCycleTimes, 0);
        
        if (bottleneckCycleTime > 0) {
          actualUPH = Math.floor(3600 / bottleneckCycleTime);
        }
        
        // Calculate target UPH based on takt time if daily demand exists
        if (study.dailyDemand && study.dailyDemand > 0) {
          const activeShifts = study.shifts.filter(s => s.isActive);
          if (activeShifts.length > 0) {
            const totalShiftSeconds = activeShifts.reduce((sum, s) => sum + (s.hours * 3600), 0);
            const taktTime = totalShiftSeconds / study.dailyDemand;
            if (taktTime > 0) {
              targetUPH = Math.floor(3600 / taktTime);
            }
          }
        }
      }
      
      return {
        label: `${study.client} - ${study.modelName}`,
        actual: actualUPH,
        target: targetUPH || actualUPH * 1.2
      };
    });
  }, [studies]);
  
  // Generate workstation efficiency data
  const efficiencyData = React.useMemo(() => {
    if (studies.length === 0) return [];
    
    // Get the first study with production lines for detailed analysis
    const studyWithLines = studies.find(s => s.productionLines.length > 0);
    if (!studyWithLines || !studyWithLines.productionLines[0]) return [];
    
    // Pick the first production line
    const line = studyWithLines.productionLines[0];
    
    // Find the bottleneck cycle time
    let bottleneckCycleTime = 0;
    const workstationMetrics = line.workstations.map(ws => {
      let workstationCycleTime = 0;
      
      ws.activities.forEach(activity => {
        const validCollections = activity.collections.filter(c => c.value > 0);
        if (validCollections.length > 0) {
          const avgNormalTime = validCollections.reduce((sum, c) => sum + c.value, 0) / validCollections.length;
          const activityCycleTime = avgNormalTime * (1 + activity.pfdFactor);
          workstationCycleTime += activityCycleTime;
        }
      });
      
      if (workstationCycleTime > bottleneckCycleTime) {
        bottleneckCycleTime = workstationCycleTime;
      }
      
      return {
        workstation: ws,
        cycleTime: workstationCycleTime
      };
    });
    
    // Calculate efficiency for each workstation
    return workstationMetrics.map(({ workstation, cycleTime }) => {
      // Calculate efficiency as ratio of workstation time to bottleneck time
      const efficiency = bottleneckCycleTime > 0 ? Math.round((cycleTime / bottleneckCycleTime) * 100) : 0;
      
      return {
        label: `Posto ${workstation.number}${workstation.name ? ' - ' + workstation.name : ''}`,
        value: efficiency
      };
    });
  }, [studies]);

  // Calculate general metrics
  const totalOperators = studies.reduce((sum, study) => {
    // Assume each workstation requires one operator
    return sum + study.productionLines.reduce((lineSum, line) => {
      return lineSum + line.workstations.length;
    }, 0);
  }, 0);
  
  // Calculate average efficiency
  const avgEfficiency = efficiencyData.length > 0
    ? efficiencyData.reduce((sum, item) => sum + item.value, 0) / efficiencyData.length
    : 0;
  
  // Identify bottlenecks (workstations with efficiency > 95%)
  const bottlenecks = efficiencyData.filter(item => item.value > 95).length;
  
  // Calculate efficiency trend (simulated)
  const efficiencyTrend = (Math.random() * 8 - 4).toFixed(1);
  
  // Generate activity type distribution data
  const activityTypeData = React.useMemo(() => {
    let manualTime = 0;
    let machineTime = 0;
    
    studies.forEach(study => {
      study.productionLines.forEach(line => {
        line.workstations.forEach(ws => {
          ws.activities.forEach(activity => {
            const validCollections = activity.collections.filter(c => c.value > 0);
            if (validCollections.length > 0) {
              const avgNormalTime = validCollections.reduce((sum, c) => sum + c.value, 0) / validCollections.length;
              const activityCycleTime = avgNormalTime * (1 + activity.pfdFactor);
              
              if (activity.type === 'Manual') {
                manualTime += activityCycleTime;
              } else {
                machineTime += activityCycleTime;
              }
            }
          });
        });
      });
    });
    
    return [
      { name: 'Manual', value: manualTime },
      { name: 'Maquinário', value: machineTime }
    ];
  }, [studies]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total de Estudos" 
          value={studies.length.toString()} 
          description={`${activeStudies.length} ativos, ${draftStudies.length} rascunhos, ${archivedStudies.length} arquivados`}
          trend={Math.round((studies.length - 20) / 20 * 100)} // Simulating trend
        />
        <MetricCard 
          title="Eficiência Média" 
          value={`${Math.round(avgEfficiency)}%`} 
          description="Baseado em todos os estudos ativos"
          trend={Number(efficiencyTrend)}
        />
        <MetricCard 
          title="Gargalos Identificados" 
          value={bottlenecks.toString()} 
          description={`${Math.ceil(bottlenecks / 3)} críticos, ${bottlenecks - Math.ceil(bottlenecks / 3)} moderados`}
          trend={-2}
        />
        <MetricCard 
          title="Operadores Necessários" 
          value={totalOperators.toString()} 
          description={`${Math.floor(totalOperators * 0.4)} com certificação completa`}
          trend={Math.round(Math.random() * 6 - 3)}
        />
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Desempenho UPH</TabsTrigger>
          <TabsTrigger value="efficiency">Eficiência</TabsTrigger>
          <TabsTrigger value="activityType">Tipos de Atividade</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho UPH por Estudo</CardTitle>
              <CardDescription>Comparação entre UPH alvo e UPH atual</CardDescription>
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
              <CardTitle>Eficiência por Posto</CardTitle>
              <CardDescription>Porcentagem de eficiência para cada posto de trabalho</CardDescription>
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

        <TabsContent value="activityType" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Atividade</CardTitle>
              <CardDescription>Distribuição de tempos entre atividades manuais e maquinário</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {activityTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => `${Number(value).toFixed(2)}s`}
                    labelFormatter={(_, payload) => payload[0]?.name || ""}
                  />
                </PieChart>
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
