
import React, { useEffect, useState } from 'react';
import { TimeStudy } from '@/utils/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, File } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface TimeStudyReportsTabProps {
  study: TimeStudy;
}

interface WorkstationMetric {
  name: string;
  cycleTime: number;
  uph: number;
  idleTime: number;
  isCritical: boolean;
}

interface ActivityTypeMetric {
  name: string;
  value: number;
}

interface ShiftProductionMetric {
  name: string;
  production: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function TimeStudyReportsTab({ study }: TimeStudyReportsTabProps) {
  const [workstationMetrics, setWorkstationMetrics] = useState<WorkstationMetric[]>([]);
  const [activityTypeMetrics, setActivityTypeMetrics] = useState<ActivityTypeMetric[]>([]);
  const [shiftProduction, setShiftProduction] = useState<ShiftProductionMetric[]>([]);
  const [taktTime, setTaktTime] = useState<number>(0);
  const [bottleneckUPH, setBottleneckUPH] = useState<number>(0);
  const [totalDailyCapacity, setTotalDailyCapacity] = useState<number>(0);
  const [alertMessages, setAlertMessages] = useState<string[]>([]);

  // Calculate metrics when study changes
  useEffect(() => {
    if (study.productionLines.length === 0) return;

    // Process data for workstation metrics
    const wsMetrics: WorkstationMetric[] = [];
    let manualTimeTotal = 0;
    let machineTimeTotal = 0;
    let maxCycleTime = 0;
    let lineUPH = 0;
    const alerts: string[] = [];

    // Calculate daily capacity and takt time
    let dailyCapacity = 0;
    
    // Process each production line
    study.productionLines.forEach(line => {
      line.workstations.forEach(ws => {
        // Calculate cycle time for workstation
        let wsCycleTime = 0;
        
        ws.activities.forEach(act => {
          // Calculate activity cycle time
          const validCollections = act.collections.filter(c => c.value > 0);
          const avgNormalTime = validCollections.length > 0 
            ? validCollections.reduce((sum, c) => sum + c.value, 0) / validCollections.length
            : 0;
            
          const actCycleTime = avgNormalTime * (1 + act.pfdFactor);
          wsCycleTime += actCycleTime;
          
          // Track time by activity type
          if (act.type === 'Manual') {
            manualTimeTotal += actCycleTime;
          } else {
            machineTimeTotal += actCycleTime;
          }
        });
        
        // Update max cycle time
        if (wsCycleTime > maxCycleTime) {
          maxCycleTime = wsCycleTime;
        }
        
        // Calculate UPH for workstation
        const wsUPH = wsCycleTime > 0 ? Math.floor(3600 / wsCycleTime) : 0;
        
        wsMetrics.push({
          name: `Posto ${ws.number}${ws.name ? ' - ' + ws.name : ''}`,
          cycleTime: wsCycleTime,
          uph: wsUPH,
          idleTime: 0, // Will calculate after finding bottleneck
          isCritical: false // Will determine after finding bottleneck
        });
      });
    });
    
    // Calculate line UPH based on bottleneck
    lineUPH = maxCycleTime > 0 ? Math.floor(3600 / maxCycleTime) : 0;
    setBottleneckUPH(lineUPH);
    
    // Calculate idle time and identify critical workstations
    const updatedWsMetrics = wsMetrics.map(ws => {
      const idleTime = maxCycleTime > 0
        ? ((maxCycleTime - ws.cycleTime) / maxCycleTime) * 100
        : 0;
      const isCritical = ws.cycleTime >= maxCycleTime * 0.95;
      
      // Add alerts for high idle time
      if (idleTime > 30) {
        alerts.push(`O posto "${ws.name}" tem ociosidade de ${idleTime.toFixed(1)}% e pode ser otimizado.`);
      }
      
      return {
        ...ws,
        idleTime,
        isCritical
      };
    });
    
    setWorkstationMetrics(updatedWsMetrics);
    
    // Calculate activity type distribution
    setActivityTypeMetrics([
      { name: 'Manual', value: manualTimeTotal },
      { name: 'Maquinário', value: machineTimeTotal }
    ]);
    
    // Calculate shift production metrics
    let totalProduction = 0;
    const shiftMetrics = study.shifts
      .filter(s => s.isActive)
      .map(shift => {
        const production = Math.floor(lineUPH * shift.hours);
        totalProduction += production;
        
        return {
          name: shift.name,
          production
        };
      });
      
    setShiftProduction(shiftMetrics);
    setTotalDailyCapacity(totalProduction);
    
    // Calculate takt time - average across active shifts
    const activeShifts = study.shifts.filter(s => s.isActive);
    if (activeShifts.length > 0 && study.dailyDemand && study.dailyDemand > 0) {
      const totalShiftSeconds = activeShifts.reduce((sum, s) => sum + (s.hours * 3600), 0);
      const taktTimeValue = totalShiftSeconds / study.dailyDemand;
      setTaktTime(taktTimeValue);
      
      // Add alert if cycle time > takt time
      if (maxCycleTime > taktTimeValue) {
        alerts.push(`ALERTA: O tempo de ciclo (${maxCycleTime.toFixed(2)}s) é maior que o takt time (${taktTimeValue.toFixed(2)}s). A linha não conseguirá atender a demanda.`);
      }
      
      // Add alert if total production < daily demand
      if (totalProduction < study.dailyDemand) {
        alerts.push(`ALERTA: A capacidade diária estimada (${totalProduction} un) é menor que a demanda diária (${study.dailyDemand} un). Considere ajustes na linha.`);
      }
    }
    
    setAlertMessages(alerts);
    
  }, [study]);

  if (study.productionLines.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertTitle>Nenhuma linha cadastrada</AlertTitle>
        <AlertDescription>
          Adicione ao menos uma linha de produção com postos de trabalho e atividades para visualizar os relatórios.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {alertMessages.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Alertas Encontrados</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              {alertMessages.map((alert, idx) => (
                <li key={idx}>{alert}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Métricas da Linha</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Takt Time</dt>
                <dd className="text-2xl font-bold">{taktTime > 0 ? `${taktTime.toFixed(2)}s` : 'N/D'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">UPH (Gargalo)</dt>
                <dd className="text-2xl font-bold">{bottleneckUPH} un/hora</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Capacidade Diária</dt>
                <dd className="text-2xl font-bold">{totalDailyCapacity} unidades</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Demanda Diária</dt>
                <dd className={`text-xl font-bold ${study.dailyDemand && totalDailyCapacity < study.dailyDemand ? 'text-red-600 dark:text-red-400' : ''}`}>
                  {study.dailyDemand} unidades
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Atendimento de Demanda</dt>
                <dd className={`text-xl font-bold ${study.dailyDemand && totalDailyCapacity < study.dailyDemand ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {study.dailyDemand ? `${Math.round((totalDailyCapacity / study.dailyDemand) * 100)}%` : 'N/D'}
                </dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Exportar Métricas
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cycle Time por Posto</CardTitle>
            <CardDescription>Comparativo de tempo de ciclo por posto de trabalho</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workstationMetrics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="s" />
                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}s`} />
                <Legend />
                <Bar 
                  dataKey="cycleTime" 
                  name="Cycle Time (s)" 
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Tempo por Tipo</CardTitle>
            <CardDescription>Manual vs. Maquinário</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityTypeMetrics}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {activityTypeMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${Number(value).toFixed(2)}s`}
                  labelFormatter={(_, payload) => payload[0]?.name || ""}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>UPH por Posto de Trabalho</CardTitle>
            <CardDescription>Unidades por hora em cada posto</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={workstationMetrics}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="uph" 
                  name="UPH" 
                  stroke="#82ca9d" 
                  activeDot={{ r: 8 }}
                />
                {taktTime > 0 && (
                  <Line
                    type="monotone"
                    dataKey={() => bottleneckUPH}
                    name="UPH Gargalo"
                    stroke="#ff7300"
                    strokeDasharray="5 5"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sugestões para Balanceamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posto</TableHead>
                <TableHead>Cycle Time</TableHead>
                <TableHead>Ociosidade</TableHead>
                <TableHead>Sugestão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workstationMetrics.map((ws) => (
                <TableRow key={ws.name}>
                  <TableCell className="font-medium">{ws.name}</TableCell>
                  <TableCell>{ws.cycleTime.toFixed(2)}s</TableCell>
                  <TableCell>{ws.idleTime.toFixed(1)}%</TableCell>
                  <TableCell>
                    {ws.isCritical ? (
                      <span className="text-red-600 dark:text-red-400">Posto gargalo - considere redistribuir atividades</span>
                    ) : ws.idleTime > 30 ? (
                      <span className="text-amber-600 dark:text-amber-400">Alta ociosidade - considere adicionar atividades</span>
                    ) : (
                      <span className="text-green-600 dark:text-green-400">Balanceado</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="flex gap-4 w-full">
            <Button variant="outline" className="flex-1">
              <File className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" className="flex-1">
              <File className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
