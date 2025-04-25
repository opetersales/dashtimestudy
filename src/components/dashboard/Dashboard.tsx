
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, Legend, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { loadFromLocalStorage } from '@/services/localStorage';
import { TimeStudy, Workstation, Activity, MetricCardData } from '@/utils/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, BarChart2, Users, Activity as ActivityIcon, Gauge } from 'lucide-react';
import { format, subDays, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Calculate dashboard data function
const calculateDashboardData = () => {
  // Load time studies from localStorage
  const studies = loadFromLocalStorage<TimeStudy[]>('timeStudies', []);
  
  // Calculate various metrics based on studies data
  return {
    studies
  };
};

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
  const studies = dashboardData.studies;
  
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

  // 🔹 ENGAJAMENTO COM A FERRAMENTA
  const engagementMetrics = useMemo(() => {
    const totalStudies = studies.length;
    const drafts = studies.filter(s => s.status === 'draft').length;
    const completed = studies.filter(s => s.status === 'active').length;
    
    // Sort studies by date to get the latest one
    const sortedStudies = [...studies].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    const latestStudy = sortedStudies.length > 0 ? sortedStudies[0] : null;
    
    // Generate monthly evolution data
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      
      const studiesInMonth = studies.filter(s => {
        const creationDate = new Date(s.createdAt);
        return creationDate.getMonth() === month.getMonth() && 
               creationDate.getFullYear() === month.getFullYear();
      }).length;
      
      monthlyData.unshift({
        month: format(month, 'MMM', { locale: ptBR }),
        count: studiesInMonth,
        name: format(month, 'MMMM', { locale: ptBR })
      });
    }
    
    return {
      totalStudies,
      drafts,
      completed,
      latestStudy,
      monthlyData
    };
  }, [studies]);
  
  // 🔹 COBERTURA DE ANÁLISE
  const coverageMetrics = useMemo(() => {
    // Count unique production lines
    const uniqueLines = new Set();
    studies.forEach(study => 
      study.productionLines.forEach(line => 
        uniqueLines.add(`${study.client}-${line.name}`)
      )
    );
    
    // Count unique clients/models
    const uniqueClientsModels = new Set();
    studies.forEach(study => 
      uniqueClientsModels.add(`${study.client}-${study.modelName}`)
    );
    
    // Count total workstations
    let totalWorkstations = 0;
    studies.forEach(study => 
      study.productionLines.forEach(line => 
        totalWorkstations += line.workstations.length
      )
    );
    
    // Calculate average activities per study
    let totalActivities = 0;
    studies.forEach(study => 
      study.productionLines.forEach(line => 
        line.workstations.forEach(ws => 
          totalActivities += ws.activities.length
        )
      )
    );
    
    const avgActivitiesPerStudy = studies.length > 0 
      ? Math.round(totalActivities / studies.length) 
      : 0;
    
    return {
      analyzeLines: uniqueLines.size,
      uniqueClientsModels: uniqueClientsModels.size,
      totalWorkstations,
      avgActivitiesPerStudy
    };
  }, [studies]);
  
  // 🔹 QUALIDADE DOS DADOS
  const qualityMetrics = useMemo(() => {
    let totalCollections = 0;
    let totalActivities = 0;
    let studiesWithoutPFD = 0;
    let studiesWithErrors = 0;
    
    studies.forEach(study => {
      let hasPFDIssue = false;
      let hasDataError = false;
      
      study.productionLines.forEach(line => {
        line.workstations.forEach(ws => {
          ws.activities.forEach(activity => {
            totalActivities++;
            if (activity.collections) {
              totalCollections += activity.collections.length;
            }
            
            if (activity.pfdFactor <= 0) {
              hasPFDIssue = true;
            }
            
            // Check for data errors (missing time collections or invalid values)
            if (!activity.collections || activity.collections.length === 0) {
              hasDataError = true;
            }
          });
        });
      });
      
      if (hasPFDIssue) studiesWithoutPFD++;
      if (hasDataError) studiesWithErrors++;
    });
    
    const avgCollectionsPerActivity = totalActivities > 0 
      ? (totalCollections / totalActivities).toFixed(1) 
      : "0";
    
    return {
      avgCollectionsPerActivity,
      studiesWithoutPFD,
      studiesWithErrors
    };
  }, [studies]);
  
  // 🔹 CAPACIDADE E PLANEJAMENTO
  const capacityMetrics = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    // Filter studies from the last 30 days
    const recentStudies = studies.filter(s => 
      isBefore(thirtyDaysAgo, parseISO(s.createdAt))
    );
    
    // Calculate total demand
    const totalDemand = recentStudies.reduce((sum, study) => 
      sum + (study.monthlyDemand || 0), 0
    );
    
    // Calculate average daily capacity
    let totalCapacity = 0;
    let studiesWithCapacity = 0;
    
    studies.forEach(study => {
      if (study.dailyCapacity && study.dailyCapacity > 0) {
        totalCapacity += study.dailyCapacity;
        studiesWithCapacity++;
      }
    });
    
    const avgDailyCapacity = studiesWithCapacity > 0 
      ? Math.round(totalCapacity / studiesWithCapacity) 
      : 0;
    
    // Studies with capacity below demand
    let studiesBelowDemand = 0;
    studies.forEach(study => {
      if (study.dailyCapacity && study.dailyDemand && 
          study.dailyCapacity < study.dailyDemand) {
        studiesBelowDemand++;
      }
    });
    
    // Studies with significant imbalance
    let studiesWithImbalance = 0;
    studies.forEach(study => {
      study.productionLines.forEach(line => {
        if (line.workstations.length > 1) {
          const cycleTimeValues = line.workstations
            .map(ws => ws.cycleTime || 0)
            .filter(ct => ct > 0);
            
          if (cycleTimeValues.length > 1) {
            const maxCT = Math.max(...cycleTimeValues);
            const minCT = Math.min(...cycleTimeValues);
            
            // If difference between min and max cycle time is more than 30%
            if (maxCT > 0 && (maxCT - minCT) / maxCT > 0.3) {
              studiesWithImbalance++;
              return; // Count each study only once
            }
          }
        }
      });
    });
    
    const percentBelowDemand = studies.length > 0 
      ? Math.round((studiesBelowDemand / studies.length) * 100) 
      : 0;
      
    const percentImbalanced = studies.length > 0 
      ? Math.round((studiesWithImbalance / studies.length) * 100) 
      : 0;
    
    return {
      totalDemand,
      avgDailyCapacity,
      percentBelowDemand,
      percentImbalanced
    };
  }, [studies]);
  
  // 🔹 ATIVIDADES RECENTES
  const recentActivitiesMetrics = useMemo(() => {
    // Sort studies by creation date (newest first)
    const recentlyCreated = [...studies]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
      
    // Sort studies by update date (newest first)
    const recentlyEdited = [...studies]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .filter(s => s.updatedAt !== s.createdAt) // Only actually edited studies
      .slice(0, 5);
      
    // Most active users
    const userActivity: Record<string, { creations: number, edits: number }> = {};
    studies.forEach(study => {
      const creator = study.createdBy;
      if (creator) {
        if (!userActivity[creator]) {
          userActivity[creator] = { creations: 0, edits: 0 };
        }
        userActivity[creator].creations += 1;
      }
    });
    
    const mostActiveUsers = Object.entries(userActivity)
      .map(([name, data]) => ({ 
        name, 
        total: data.creations + data.edits,
        creations: data.creations,
        edits: data.edits
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
      
    return {
      recentlyCreated,
      recentlyEdited,
      mostActiveUsers
    };
  }, [studies]);

  // Prepare metric cards data
  const engagementCards: MetricCardData[] = [
    {
      title: "Total de Estudos",
      value: engagementMetrics.totalStudies.toString(),
      description: "Estudos cadastrados no sistema",
      trend: 0
    },
    {
      title: "Estudos em Andamento",
      value: engagementMetrics.drafts.toString(),
      description: "Rascunhos ainda não finalizados",
      trend: 0
    },
    {
      title: "Estudos Finalizados",
      value: engagementMetrics.completed.toString(),
      description: "Estudos ativos e publicados",
      trend: engagementMetrics.totalStudies > 0 
        ? Math.round((engagementMetrics.completed / engagementMetrics.totalStudies) * 100) - 50
        : 0
    }
  ];

  const coverageCards: MetricCardData[] = [
    {
      title: "Linhas Analisadas",
      value: coverageMetrics.analyzeLines.toString(),
      description: "Linhas de produção únicas",
      trend: 0
    },
    {
      title: "Modelos/Clientes",
      value: coverageMetrics.uniqueClientsModels.toString(),
      description: "Combinações únicas de cliente e modelo",
      trend: 0
    },
    {
      title: "Postos Analisados",
      value: coverageMetrics.totalWorkstations.toString(),
      description: "Total de postos de trabalho",
      trend: 0
    },
    {
      title: "Atividades por Estudo",
      value: coverageMetrics.avgActivitiesPerStudy.toString(),
      description: "Média de atividades registradas",
      trend: coverageMetrics.avgActivitiesPerStudy > 5 ? 10 : -10
    }
  ];

  const qualityCards: MetricCardData[] = [
    {
      title: "Coletas por Atividade",
      value: qualityMetrics.avgCollectionsPerActivity,
      description: "Média de medições por atividade",
      trend: parseFloat(qualityMetrics.avgCollectionsPerActivity) >= 3 ? 20 : -20
    },
    {
      title: "Estudos sem PF&D",
      value: qualityMetrics.studiesWithoutPFD.toString(),
      description: "Estudos sem fator definido",
      trend: qualityMetrics.studiesWithoutPFD > 0 ? -30 : 10
    },
    {
      title: "Estudos com Erros",
      value: qualityMetrics.studiesWithErrors.toString(),
      description: "Dados incompletos ou inválidos",
      trend: qualityMetrics.studiesWithErrors > 0 ? -40 : 10
    }
  ];

  const capacityCards: MetricCardData[] = [
    {
      title: "Demanda Total (30d)",
      value: capacityMetrics.totalDemand.toLocaleString() + " un",
      description: "Soma da demanda nos últimos 30 dias",
      trend: 0
    },
    {
      title: "Capacidade Diária",
      value: capacityMetrics.avgDailyCapacity.toLocaleString() + " un",
      description: "Média da capacidade diária",
      trend: 0
    },
    {
      title: "Abaixo da Demanda",
      value: capacityMetrics.percentBelowDemand + "%",
      description: "Estudos com capacidade insuficiente",
      trend: -capacityMetrics.percentBelowDemand
    },
    {
      title: "Desequilíbrio",
      value: capacityMetrics.percentImbalanced + "%",
      description: "Estudos com linha desequilibrada",
      trend: -capacityMetrics.percentImbalanced
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
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 h-auto">
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Engajamento</span>
          </TabsTrigger>
          <TabsTrigger value="coverage" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Cobertura</span>
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <ActivityIcon className="h-4 w-4" />
            <span>Qualidade</span>
          </TabsTrigger>
          <TabsTrigger value="capacity" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            <span>Capacidade</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Atividades Recentes</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Engajamento */}
        <TabsContent value="engagement" className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {engagementCards.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                description={metric.description}
                trend={metric.trend}
              />
            ))}
            
            {/* Latest Study Card */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Último Estudo Realizado</CardTitle>
              </CardHeader>
              <CardContent>
                {engagementMetrics.latestStudy ? (
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">{engagementMetrics.latestStudy.client} - {engagementMetrics.latestStudy.modelName}</h3>
                      <p className="text-muted-foreground">Responsável: {engagementMetrics.latestStudy.responsiblePerson}</p>
                    </div>
                    <div className="text-right">
                      <p>Data: {format(new Date(engagementMetrics.latestStudy.studyDate), 'dd/MM/yyyy')}</p>
                      <p className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        engagementMetrics.latestStudy.status === 'draft' 
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                        {engagementMetrics.latestStudy.status === 'draft' ? 'Rascunho' : 'Finalizado'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">Nenhum estudo cadastrado</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Monthly Studies Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Estudos por Mês</CardTitle>
              <CardDescription>Quantidade de estudos criados em cada mês</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {engagementMetrics.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementMetrics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip
                      formatter={(value: number) => [`${value} estudos`, 'Total']}
                      labelFormatter={(label) => `Mês: ${label}`}
                    />
                    <Bar dataKey="count" fill="#8884d8" name="Estudos">
                      {engagementMetrics.monthlyData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Dados insuficientes para exibir o gráfico
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Coverage Tab */}
        <TabsContent value="coverage" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coverageCards.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                description={metric.description}
                trend={metric.trend}
              />
            ))}
          </div>
          
          {/* Coverage Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Modelos por Cliente</CardTitle>
                <CardDescription>Quantidade de modelos analisados por cliente</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {clients.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clients.map(client => ({
                          name: client,
                          value: studies.filter(s => s.client === client).length
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {clients.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value} estudos`, '']}
                        labelFormatter={(name) => `Cliente: ${name}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Dados insuficientes para exibir o gráfico
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Complexidade dos Estudos</CardTitle>
                <CardDescription>Relação entre postos e atividades</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {studies.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid />
                      <XAxis 
                        type="number" 
                        dataKey="workstations" 
                        name="Postos" 
                        unit=" postos"
                      />
                      <YAxis 
                        type="number" 
                        dataKey="activities" 
                        name="Atividades" 
                        unit=" atividades"
                      />
                      <ZAxis range={[50, 400]} />
                      <RechartsTooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        formatter={(value: number, name: string) => [value.toString(), name]}
                      />
                      <Scatter 
                        name="Estudos" 
                        data={studies.map(study => {
                          let workstationCount = 0;
                          let activityCount = 0;
                          
                          study.productionLines.forEach(line => {
                            workstationCount += line.workstations.length;
                            line.workstations.forEach(ws => {
                              activityCount += ws.activities.length;
                            });
                          });
                          
                          return {
                            name: `${study.client} - ${study.modelName}`,
                            workstations: workstationCount,
                            activities: activityCount,
                          };
                        })} 
                        fill="#8884d8"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Dados insuficientes para exibir o gráfico
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {qualityCards.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                description={metric.description}
                trend={metric.trend}
              />
            ))}
          </div>
          
          {/* Quality Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Coletas</CardTitle>
                <CardDescription>Quantas medições são feitas por atividade</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {studies.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Sem coletas', value: studies.reduce((count, study) => {
                          let emptyCollections = 0;
                          study.productionLines.forEach(line => {
                            line.workstations.forEach(ws => {
                              ws.activities.forEach(act => {
                                if (!act.collections || act.collections.length === 0) {
                                  emptyCollections++;
                                }
                              });
                            });
                          });
                          return count + emptyCollections;
                        }, 0) },
                        { name: '1-2 coletas', value: studies.reduce((count, study) => {
                          let fewCollections = 0;
                          study.productionLines.forEach(line => {
                            line.workstations.forEach(ws => {
                              ws.activities.forEach(act => {
                                if (act.collections && act.collections.length > 0 && act.collections.length <= 2) {
                                  fewCollections++;
                                }
                              });
                            });
                          });
                          return count + fewCollections;
                        }, 0) },
                        { name: '3-5 coletas', value: studies.reduce((count, study) => {
                          let mediumCollections = 0;
                          study.productionLines.forEach(line => {
                            line.workstations.forEach(ws => {
                              ws.activities.forEach(act => {
                                if (act.collections && act.collections.length >= 3 && act.collections.length <= 5) {
                                  mediumCollections++;
                                }
                              });
                            });
                          });
                          return count + mediumCollections;
                        }, 0) },
                        { name: '6+ coletas', value: studies.reduce((count, study) => {
                          let manyCollections = 0;
                          study.productionLines.forEach(line => {
                            line.workstations.forEach(ws => {
                              ws.activities.forEach(act => {
                                if (act.collections && act.collections.length > 5) {
                                  manyCollections++;
                                }
                              });
                            });
                          });
                          return count + manyCollections;
                        }, 0) }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value} atividades`, '']}
                      />
                      <Bar dataKey="value" name="Atividades">
                        <Cell fill="#FF8042" /> {/* red for no collections */}
                        <Cell fill="#FFBB28" /> {/* yellow for few */}
                        <Cell fill="#00C49F" /> {/* green for medium */}
                        <Cell fill="#0088FE" /> {/* blue for many */}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Dados insuficientes para exibir o gráfico
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Fatores PF&D Utilizados</CardTitle>
                <CardDescription>Distribuição dos fatores em uso</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {studies.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Sem fator', value: studies.reduce((count, study) => {
                          let noPfd = 0;
                          study.productionLines.forEach(line => {
                            line.workstations.forEach(ws => {
                              ws.activities.forEach(act => {
                                if (act.pfdFactor <= 0) {
                                  noPfd++;
                                }
                              });
                            });
                          });
                          return count + noPfd;
                        }, 0) },
                        { name: '< 10%', value: studies.reduce((count, study) => {
                          let lowPfd = 0;
                          study.productionLines.forEach(line => {
                            line.workstations.forEach(ws => {
                              ws.activities.forEach(act => {
                                if (act.pfdFactor > 0 && act.pfdFactor < 0.1) {
                                  lowPfd++;
                                }
                              });
                            });
                          });
                          return count + lowPfd;
                        }, 0) },
                        { name: '10%', value: studies.reduce((count, study) => {
                          let stdPfd = 0;
                          study.productionLines.forEach(line => {
                            line.workstations.forEach(ws => {
                              ws.activities.forEach(act => {
                                if (act.pfdFactor === 0.1) {
                                  stdPfd++;
                                }
                              });
                            });
                          });
                          return count + stdPfd;
                        }, 0) },
                        { name: '> 10%', value: studies.reduce((count, study) => {
                          let highPfd = 0;
                          study.productionLines.forEach(line => {
                            line.workstations.forEach(ws => {
                              ws.activities.forEach(act => {
                                if (act.pfdFactor > 0.1) {
                                  highPfd++;
                                }
                              });
                            });
                          });
                          return count + highPfd;
                        }, 0) }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value} atividades`, '']}
                      />
                      <Bar dataKey="value" name="Atividades">
                        <Cell fill="#FF8042" /> {/* red for no PFD */}
                        <Cell fill="#FFBB28" /> {/* yellow for low */}
                        <Cell fill="#00C49F" /> {/* green for standard */}
                        <Cell fill="#0088FE" /> {/* blue for high */}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Dados insuficientes para exibir o gráfico
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Capacity Tab */}
        <TabsContent value="capacity" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {capacityCards.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                description={metric.description}
                trend={metric.trend}
              />
            ))}
          </div>
          
          {/* Capacity Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Capacidade vs. Demanda</CardTitle>
                <CardDescription>Comparação entre demanda diária e capacidade produtiva</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {studies.filter(s => s.dailyCapacity && s.dailyDemand).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={studies
                        .filter(s => s.dailyCapacity && s.dailyDemand)
                        .map(s => ({
                          name: `${s.client} - ${s.modelName}`.substring(0, 20),
                          capacity: s.dailyCapacity || 0,
                          demand: s.dailyDemand || 0
                        }))
                        .slice(0, 10)} // Limit to 10 studies for readability
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
                      <Legend />
                      <Bar 
                        dataKey="capacity" 
                        name="Capacidade" 
                        fill="#00C49F"
                      />
                      <Bar 
                        dataKey="demand" 
                        name="Demanda" 
                        fill="#8884d8"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Dados insuficientes para exibir o gráfico
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Desequilíbrio de Linha</CardTitle>
                <CardDescription>Distribuição de tempo entre postos de trabalho</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {studies.length > 0 && studies
                  .flatMap(s => s.productionLines)
                  .filter(l => l.workstations.length > 1).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={studies
                        .flatMap(s => s.productionLines
                          .filter(l => l.workstations.length > 0)
                          .map(l => {
                            // Sort workstations by cycle time
                            const sortedWorkstations = [...l.workstations]
                              .filter(w => w.cycleTime && w.cycleTime > 0)
                              .sort((a, b) => (a.cycleTime || 0) - (b.cycleTime || 0));
                              
                            if (sortedWorkstations.length <= 1) return null;
                            
                            // Calculate max cycle time for normalization
                            const maxCT = Math.max(...sortedWorkstations.map(w => w.cycleTime || 0));
                            
                            // Generate data points for line chart
                            return {
                              name: `${s.client} - ${l.name}`,
                              // Normalize cycle times to percentages of max
                              distribution: sortedWorkstations.map((w, i) => ({
                                station: i + 1,
                                value: ((w.cycleTime || 0) / maxCT) * 100
                              }))
                            };
                          })
                        )
                        .filter(Boolean)
                        .slice(0, 5)} // Limit to 5 lines for readability
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name"
                        tick={false} // Hide x-axis labels to avoid clutter
                      />
                      <YAxis 
                        label={{ value: '% do tempo máximo', angle: -90, position: 'insideLeft' }}
                        domain={[0, 100]}
                      />
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Tempo']}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="distribution[0].value" 
                        name="Linha 1"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="distribution[1].value" 
                        name="Linha 2"  
                        stroke="#82ca9d"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Dados insuficientes para análise de balanceamento
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Recent Activities */}
        <TabsContent value="recent" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recently Created */}
            <Card>
              <CardHeader>
                <CardTitle>Últimos Estudos Criados</CardTitle>
                <CardDescription>Os 5 estudos mais recentes</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-2 px-4 text-left">Estudo</th>
                        <th className="py-2 px-4 text-left">Data</th>
                        <th className="py-2 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivitiesMetrics.recentlyCreated.map((study, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{study.client} - {study.modelName}</td>
                          <td className="py-2 px-4">{format(new Date(study.createdAt), 'dd/MM/yyyy')}</td>
                          <td className="py-2 px-4 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                              study.status === 'draft' 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            }`}>
                              {study.status === 'draft' ? 'Rascunho' : 'Finalizado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {recentActivitiesMetrics.recentlyCreated.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-muted-foreground">
                            Nenhum estudo criado recentemente
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Recently Edited */}
            <Card>
              <CardHeader>
                <CardTitle>Últimos Estudos Editados</CardTitle>
                <CardDescription>Os 5 estudos modificados mais recentemente</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-2 px-4 text-left">Estudo</th>
                        <th className="py-2 px-4 text-left">Atualização</th>
                        <th className="py-2 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivitiesMetrics.recentlyEdited.map((study, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{study.client} - {study.modelName}</td>
                          <td className="py-2 px-4">{format(new Date(study.updatedAt), 'dd/MM/yyyy')}</td>
                          <td className="py-2 px-4 text-center">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                              study.status === 'draft' 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            }`}>
                              {study.status === 'draft' ? 'Rascunho' : 'Finalizado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {recentActivitiesMetrics.recentlyEdited.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-4 text-center text-muted-foreground">
                            Nenhum estudo editado recentemente
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            {/* Most Active Users */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Usuários Mais Ativos</CardTitle>
                <CardDescription>Usuários com maior número de estudos criados</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-2 px-4 text-left">Usuário</th>
                        <th className="py-2 px-4 text-right">Estudos Criados</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivitiesMetrics.mostActiveUsers.map((user, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-4">{user.name}</td>
                          <td className="py-2 px-4 text-right">{user.creations}</td>
                        </tr>
                      ))}
                      {recentActivitiesMetrics.mostActiveUsers.length === 0 && (
                        <tr>
                          <td colSpan={2} className="py-4 text-center text-muted-foreground">
                            Dados de usuários insuficientes
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
  trend?: number;
}

function MetricCard({ title, value, description, trend = 0 }: MetricCardProps) {
  const getTrendColor = (trend: number) => {
    // For metrics where higher is better
    if (title.includes("Demanda") || title.includes("Abaixo") || title.includes("Sem") || title.includes("Erros") || title.includes("Desequilíbrio")) {
      return trend < 0 ? "text-green-600 dark:text-green-400" : trend > 0 ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400";
    }
    // For other metrics where higher is better
    return trend > 0 ? "text-green-600 dark:text-green-400" : trend < 0 ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400";
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
            {trend > 0 ? '+' : ''}{Math.abs(trend)}% {trend > 0 ? 'acima' : 'abaixo'} do benchmark
          </p>
        )}
      </CardContent>
    </Card>
  );
}
