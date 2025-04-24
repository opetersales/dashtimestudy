import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar
} from 'recharts';
import { loadFromLocalStorage } from '@/services/localStorage';
import { TimeStudy, Workstation, Activity, PerformanceData, MetricCardData } from '@/utils/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState(() => calculateDashboardData());

  useEffect(() => {
    const handleUpdate = () => {
      setDashboardData(calculateDashboardData());
    };

    window.addEventListener('dashboardUpdate', handleUpdate);
    return () => window.removeEventListener('dashboardUpdate', handleUpdate);
  }, []);

  // Filter states
  const [timePeriod, setTimePeriod] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<string>("all");
  
  // Load time studies from localStorage
  const studies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
  
  // Apply filters
  const filteredStudies = useMemo(() => {
    let filtered = [...studies];
    
    if (timePeriod !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (timePeriod) {
        case '7days':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          cutoffDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(study => {
        const studyDate = new Date(study.studyDate);
        return studyDate >= cutoffDate;
      });
    }
    
    if (selectedClient !== 'all') {
      filtered = filtered.filter(study => study.client === selectedClient);
    }
    
    return filtered;
  }, [studies, timePeriod, selectedClient]);
  
  // Get list of unique clients for filter
  const clients = useMemo(() => {
    const uniqueClients = new Set(studies.map(study => study.client));
    return Array.from(uniqueClients);
  }, [studies]);
  
  // Calculate daily capacity metrics
  const capacityMetrics = useMemo(() => {
    if (filteredStudies.length === 0) return { dailyCapacity: 0, dailyTarget: 0 };
    
    const totalCapacity = filteredStudies.reduce((sum, study) => {
      const studyCapacity = study.dailyCapacity || 0;
      return sum + studyCapacity;
    }, 0);
    
    const totalTarget = filteredStudies.reduce((sum, study) => {
      return sum + (study.dailyDemand || 0);
    }, 0);
    
    return {
      dailyCapacity: totalCapacity / filteredStudies.length,
      dailyTarget: totalTarget / filteredStudies.length
    };
  }, [filteredStudies]);
  
  // Calculate time per unit metrics
  const timePerUnitMetrics = useMemo(() => {
    if (filteredStudies.length === 0) return { avgTimePerUnit: 0 };
    
    const totalTime = filteredStudies.reduce((sum, study) => {
      return sum + (study.totalTimePerUnit || 0);
    }, 0);
    
    return {
      avgTimePerUnit: totalTime / filteredStudies.length
    };
  }, [filteredStudies]);
  
  // Calculate efficiency metrics
  const efficiencyMetrics = useMemo(() => {
    if (filteredStudies.length === 0) return { avgEfficiency: 0, balanceRate: 0 };
    
    const totalEfficiency = filteredStudies.reduce((sum, study) => {
      return sum + (study.efficiency || 0);
    }, 0);
    
    // Calculate balance rate as average of (1 - station variance)
    let totalBalanceRate = 0;
    let studiesWithBalance = 0;
    
    filteredStudies.forEach(study => {
      study.productionLines.forEach(line => {
        if (line.workstations.length > 1) {
          const stationCTs = line.workstations.map(ws => ws.cycleTime || 0);
          const maxCT = Math.max(...stationCTs);
          const avgCT = stationCTs.reduce((sum, ct) => sum + ct, 0) / stationCTs.length;
          
          if (maxCT > 0) {
            const variance = stationCTs.reduce((sum, ct) => sum + Math.abs(ct - avgCT), 0) / stationCTs.length / maxCT;
            const balanceRate = 1 - variance;
            totalBalanceRate += balanceRate;
            studiesWithBalance++;
          }
        }
      });
    });
    
    return {
      avgEfficiency: totalEfficiency / filteredStudies.length,
      balanceRate: studiesWithBalance > 0 ? totalBalanceRate / studiesWithBalance : 0
    };
  }, [filteredStudies]);
  
  // Calculate UPH metrics
  const uphMetrics = useMemo(() => {
    if (filteredStudies.length === 0) return { avgUPH: 0 };
    
    const totalUPH = filteredStudies.reduce((sum, study) => {
      const studyUPH = study.productionLines.reduce((lineSum, line) => {
        return lineSum + (line.uph || 0);
      }, 0);
      
      return sum + (studyUPH / Math.max(1, study.productionLines.length));
    }, 0);
    
    return {
      avgUPH: totalUPH / filteredStudies.length
    };
  }, [filteredStudies]);
  
  // Identify bottlenecks
  const bottleneckMetrics = useMemo(() => {
    const bottlenecksMap = new Map<string, number>();
    let totalBottlenecks = 0;
    
    filteredStudies.forEach(study => {
      study.productionLines.forEach(line => {
        // Find the bottleneck (highest CT) workstation
        const maxCT = Math.max(...line.workstations.map(ws => ws.cycleTime || 0));
        
        line.workstations.forEach(ws => {
          if ((ws.cycleTime || 0) >= maxCT * 0.95) {
            // Count as bottleneck if within 5% of max
            const key = `${ws.number}${ws.name ? ` - ${ws.name}` : ''}`;
            const count = bottlenecksMap.get(key) || 0;
            bottlenecksMap.set(key, count + 1);
            totalBottlenecks++;
          }
        });
      });
    });
    
    // Filter bottlenecks that appear in more than one study
    const criticalBottlenecks = Array.from(bottlenecksMap.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]);
    
    const criticalPercentage = filteredStudies.length > 0
      ? criticalBottlenecks.length / Math.max(1, bottlenecksMap.size)
      : 0;
      
    return {
      criticalPercentage,
      bottlenecksMap: Array.from(bottlenecksMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 bottlenecks for charts
    };
  }, [filteredStudies]);
  
  // Generate efficiency trend data
  const efficiencyTrendData = useMemo(() => {
    return filteredStudies
      .sort((a, b) => new Date(a.studyDate).getTime() - new Date(b.studyDate).getTime())
      .map(study => ({
        date: new Date(study.studyDate).toLocaleDateString(),
        efficiency: Math.round((study.efficiency || 0) * 100),
        client: study.client,
        model: study.modelName
      }));
  }, [filteredStudies]);
  
  // Generate activity type distribution
  const activityTypeData = useMemo(() => {
    let manualTime = 0;
    let machineTime = 0;
    
    filteredStudies.forEach(study => {
      study.productionLines.forEach(line => {
        line.workstations.forEach(ws => {
          ws.activities.forEach(activity => {
            if (activity.averageNormalTime && activity.pfdFactor) {
              const activityCycleTime = activity.averageNormalTime * (1 + activity.pfdFactor);
              
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
    
    const total = manualTime + machineTime;
    
    return [
      { name: 'Manual', value: manualTime, percentage: Math.round((manualTime / total) * 100) || 0 },
      { name: 'Maquinário', value: machineTime, percentage: Math.round((machineTime / total) * 100) || 0 }
    ];
  }, [filteredStudies]);
  
  // Generate UPH actual vs target comparison
  const uphComparisonData = useMemo(() => {
    return filteredStudies.map(study => {
      // Calculate actual UPH from bottleneck cycle time
      let actualUPH = 0;
      if (study.productionLines.length > 0) {
        const bottleneckCT = Math.max(
          ...study.productionLines.map(line => 
            Math.max(...line.workstations.map(ws => ws.cycleTime || 0))
          )
        );
        
        if (bottleneckCT > 0) {
          actualUPH = Math.floor(3600 / bottleneckCT);
        }
      }
      
      // Calculate target UPH based on daily demand and shift hours
      let targetUPH = 0;
      const totalShiftHours = study.shifts.reduce((sum, shift) => sum + (shift.isActive ? shift.hours : 0), 0);
      
      if (study.dailyDemand && totalShiftHours > 0) {
        targetUPH = Math.ceil(study.dailyDemand / totalShiftHours);
      }
      
      return {
        name: `${study.client} - ${study.modelName}`,
        actual: actualUPH,
        target: targetUPH,
        x: targetUPH,
        y: actualUPH
      };
    });
  }, [filteredStudies]);
  
  // Generate alerts
  const alerts = useMemo(() => {
    const alertsList = [];
    
    // Check for recurring bottlenecks
    const recurringBottlenecks = bottleneckMetrics.bottlenecksMap
      .filter(b => b.count > 1)
      .slice(0, 3);
    
    if (recurringBottlenecks.length > 0) {
      alertsList.push({
        message: `${recurringBottlenecks.length} postos aparecem como gargalo em múltiplos estudos`,
        detail: recurringBottlenecks.map(b => `${b.name} (${b.count}x)`).join(', ')
      });
    }
    
    // Check if UPH is below target
    if (uphComparisonData.length > 2) {
      const belowTarget = uphComparisonData.filter(d => d.actual < d.target);
      const percentage = Math.round((belowTarget.length / uphComparisonData.length) * 100);
      
      if (percentage > 20) {
        alertsList.push({
          message: `UPH está abaixo da meta em ${percentage}% dos estudos`,
          detail: `${belowTarget.length} de ${uphComparisonData.length} estudos não atingem a meta`
        });
      }
    }
    
    // Check if efficiency is decreasing
    if (efficiencyTrendData.length >= 3) {
      const last3 = efficiencyTrendData.slice(-3);
      const trend = last3[last3.length-1].efficiency - last3[0].efficiency;
      
      if (trend < -5) {
        alertsList.push({
          message: `A eficiência diminuiu ${Math.abs(trend)}% nos últimos estudos`,
          detail: `Verifique fatores que podem estar causando essa redução`
        });
      }
    }
    
    return alertsList;
  }, [
    bottleneckMetrics.bottlenecksMap,
    uphComparisonData,
    efficiencyTrendData
  ]);
  
  // Prepare metric cards data
  const metricCardsData: MetricCardData[] = [
    {
      title: "Capacidade Média Diária",
      value: Math.round(capacityMetrics.dailyCapacity).toLocaleString() + " un",
      description: `Meta: ${Math.round(capacityMetrics.dailyTarget).toLocaleString()} unidades/dia`,
      trend: capacityMetrics.dailyTarget > 0 
        ? Math.round((capacityMetrics.dailyCapacity / capacityMetrics.dailyTarget - 1) * 100) 
        : 0
    },
    {
      title: "Tempo Médio por Unidade",
      value: timePerUnitMetrics.avgTimePerUnit.toFixed(1) + " s",
      description: "Tempo total para produzir uma unidade",
      trend: 0  // Neutral trend for now
    },
    {
      title: "Eficiência Média",
      value: Math.round(efficiencyMetrics.avgEfficiency * 100) + "%",
      description: "Aproveitamento dos recursos disponíveis",
      trend: Math.round(efficiencyMetrics.avgEfficiency * 100) - 80  // Compare to 80% benchmark
    },
    {
      title: "Balanceamento Médio",
      value: Math.round(efficiencyMetrics.balanceRate * 100) + "%",
      description: "Equilíbrio entre os postos de trabalho",
      trend: Math.round(efficiencyMetrics.balanceRate * 100) - 75  // Compare to 75% benchmark
    },
    {
      title: "UPH Média",
      value: Math.round(uphMetrics.avgUPH).toString(),
      description: "Unidades produzidas por hora",
      trend: uphMetrics.avgUPH > 0 
        ? Math.round((uphMetrics.avgUPH / (capacityMetrics.dailyTarget / 8) - 1) * 100) 
        : 0  // Compare to 8-hour production target
    },
    {
      title: "Postos Críticos",
      value: bottleneckMetrics.criticalPercentage > 0 
        ? Math.round(bottleneckMetrics.criticalPercentage * 100) + "%" 
        : "0%",
      description: "Postos que aparecem como gargalo em múltiplos estudos",
      trend: -Math.round(bottleneckMetrics.criticalPercentage * 100)  // Negative trend is good here
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/20 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium block mb-1">Período</label>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium block mb-1">Cliente</label>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients.map(client => (
                <SelectItem key={client} value={client}>{client}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Alertas e Recomendações
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert, index) => (
              <Card key={index} className="border-l-4 border-l-amber-500">
                <CardContent className="p-4">
                  <p className="font-medium">⚠️ {alert.message}</p>
                  <p className="text-sm text-muted-foreground mt-1">{alert.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCardsData.map((metric, index) => (
          <MetricCard 
            key={index}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            trend={metric.trend}
          />
        ))}
      </div>

      <Tabs defaultValue="efficiency" className="space-y-4">
        <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="efficiency">Eficiência</TabsTrigger>
          <TabsTrigger value="bottlenecks">Gargalos</TabsTrigger>
          <TabsTrigger value="uph">UPH vs Meta</TabsTrigger>
          <TabsTrigger value="activityType">Tipos de Atividade</TabsTrigger>
        </TabsList>
        
        {/* Efficiency trend */}
        <TabsContent value="efficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Eficiência</CardTitle>
              <CardDescription>Tendência de eficiência dos estudos ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {efficiencyTrendData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={efficiencyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <RechartsTooltip 
                      formatter={(value, name) => [`${value}%`, 'Eficiência']}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="efficiency" 
                      name="Eficiência (%)" 
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Dados insuficientes para exibir o gráfico de tendência
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bottlenecks */}
        <TabsContent value="bottlenecks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Postos mais Frequentemente Identificados como Gargalos</CardTitle>
              <CardDescription>Postos que aparecem como gargalo em múltiplos estudos</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {bottleneckMetrics.bottlenecksMap.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={bottleneckMetrics.bottlenecksMap} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <RechartsTooltip />
                    <Bar 
                      dataKey="count" 
                      name="Frequência" 
                      fill="#ff8042"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Dados insuficientes para identificar gargalos recorrentes
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* UPH scatter */}
        <TabsContent value="uph" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>UPH Real vs. Meta</CardTitle>
              <CardDescription>Comparação entre UPH calculada e UPH necessária para atender demanda</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {uphComparisonData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="UPH Meta" 
                      unit=""
                      domain={['dataMin - 5', 'dataMax + 5']} 
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="UPH Real" 
                      unit=""
                      domain={['dataMin - 5', 'dataMax + 5']} 
                    />
                    <ZAxis range={[100, 100]} />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name, props) => {
                        if (name === 'x') return [`${props.payload.target}`, 'UPH Meta'];
                        if (name === 'y') return [`${props.payload.actual}`, 'UPH Real'];
                        return [value, name];
                      }}
                      labelFormatter={(value) => `${uphComparisonData.find(d => d.x === value)?.name || ''}`}
                    />
                    <Scatter 
                      name="UPH" 
                      data={uphComparisonData} 
                      fill="#8884d8"
                    />
                    {/* Diagonal line for reference (y=x) */}
                    <Line 
                      type="monotone" 
                      dataKey="target"
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={false}
                      legendType="none"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Dados insuficientes para análise de UPH
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity types */}
        <TabsContent value="activityType" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Atividade</CardTitle>
              <CardDescription>Distribuição de tempos entre atividades manuais e maquinário</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {activityTypeData[0].value + activityTypeData[1].value > 0 ? (
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
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {activityTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value) => `${parseFloat(value).toFixed(2)}s`}
                      labelFormatter={(_, payload) => payload[0]?.name || ""}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Dados insuficientes para análise de tipos de atividade
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Ranking tables */}
      {filteredStudies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Postos mais Críticos</CardTitle>
              <CardDescription>Ranking de postos por frequência como gargalo</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-2 px-4 text-left">Posto</th>
                      <th className="py-2 px-4 text-right">Ocorrências</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bottleneckMetrics.bottlenecksMap.slice(0, 5).map((bottleneck, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">{bottleneck.name}</td>
                        <td className="py-2 px-4 text-right">{bottleneck.count}x</td>
                      </tr>
                    ))}
                    {bottleneckMetrics.bottlenecksMap.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-4 text-center text-muted-foreground">
                          Sem dados suficientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Estudos com Maior Ociosidade</CardTitle>
              <CardDescription>Ranking de estudos com pior balanceamento de linha</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-2 px-4 text-left">Estudo</th>
                      <th className="py-2 px-4 text-right">Ociosidade média</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudies
                      .map(study => {
                        // Calculate average idle time for this study
                        let totalIdleTime = 0;
                        let workstationCount = 0;
                        
                        study.productionLines.forEach(line => {
                          line.workstations.forEach(ws => {
                            if (ws.idleTime !== undefined) {
                              totalIdleTime += ws.idleTime;
                              workstationCount++;
                            }
                          });
                        });
                        
                        const avgIdleTime = workstationCount > 0 ? totalIdleTime / workstationCount : 0;
                        
                        return {
                          name: `${study.client} - ${study.modelName}`,
                          avgIdleTime
                        };
                      })
                      .sort((a, b) => b.avgIdleTime - a.avgIdleTime)
                      .slice(0, 5)
                      .map((study, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{study.name}</td>
                          <td className="py-2 px-4 text-right">{study.avgIdleTime.toFixed(1)}%</td>
                        </tr>
                      ))}
                    {filteredStudies.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-4 text-center text-muted-foreground">
                          Sem dados suficientes
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  trend?: number;
}

function MetricCard({ title, value, description, trend = 0 }: MetricCardProps) {
  const getTrendColor = (trend: number) => {
    // For metrics where higher is better
    if (title.includes("Postos Críticos") || title.includes("Tempo")) {
      return trend < 0 ? "text-green-600" : trend > 0 ? "text-red-600" : "text-gray-500";
    }
    // For other metrics where higher is better
    return trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-500";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend !== 0 && (
          <p className={`text-xs mt-2 ${getTrendColor(trend)} flex items-center`}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} 
            {trend > 0 ? '+' : ''}{trend}% {trend > 0 ? 'acima' : 'abaixo'} do benchmark
          </p>
        )}
      </CardContent>
    </Card>
  );
}
