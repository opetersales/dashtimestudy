
import React, { useEffect, useState } from 'react';
import { TimeStudy, ProductionLine, Workstation, Activity } from '@/utils/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TimeStudyCalculationsTabProps {
  study: TimeStudy;
}

interface CalculationResult {
  lineId: string;
  lineName: string;
  cycleTime: number;
  uph: number;
  workstations: {
    id: string;
    number: string;
    name?: string;
    cycleTime: number;
    uph: number;
    idleTime: number;
    isCritical: boolean;
    activities: {
      id: string;
      description: string;
      averageNormalTime: number;
      cycleTime: number;
      type: 'Manual' | 'Maquinário';
    }[];
  }[];
  totalManualTime: number;
  totalMachineTime: number;
}

export function TimeStudyCalculationsTab({ study }: TimeStudyCalculationsTabProps) {
  const [calculationResults, setCalculationResults] = useState<CalculationResult[]>([]);

  useEffect(() => {
    // Calculate metrics for each line
    const results: CalculationResult[] = study.productionLines.map(line => {
      // Calculate metrics for each workstation
      const workstationsWithMetrics = line.workstations.map(ws => {
        // Calculate metrics for each activity
        const activitiesWithMetrics = ws.activities.map(act => {
          // Calculate average normal time from collections
          const validCollections = act.collections.filter(c => c.value > 0);
          const averageNormalTime = validCollections.length > 0 
            ? validCollections.reduce((sum, c) => sum + c.value, 0) / validCollections.length
            : 0;
            
          // Calculate cycle time with PF&D factor
          const cycleTime = averageNormalTime * (1 + act.pfdFactor);
          
          return {
            ...act,
            averageNormalTime,
            cycleTime
          };
        });
        
        // Calculate workstation cycle time (sum of all activities)
        const cycleTime = activitiesWithMetrics.reduce((sum, act) => sum + act.cycleTime, 0);
        
        // Calculate UPH (Units Per Hour)
        const uph = cycleTime > 0 ? Math.floor(3600 / cycleTime) : 0;
        
        return {
          ...ws,
          cycleTime,
          uph,
          idleTime: 0, // Will be calculated after finding bottleneck
          isCritical: false, // Will be determined after finding bottleneck
          activities: activitiesWithMetrics
        };
      });
      
      // Find bottleneck (highest cycle time)
      const bottleneckCycleTime = Math.max(
        ...workstationsWithMetrics.map(ws => ws.cycleTime), 
        0
      );
      
      // Calculate line UPH based on bottleneck
      const lineUph = bottleneckCycleTime > 0 ? Math.floor(3600 / bottleneckCycleTime) : 0;
      
      // Calculate idle time for each workstation
      const workstationsWithIdleTime = workstationsWithMetrics.map(ws => {
        const idleTime = bottleneckCycleTime > 0
          ? ((bottleneckCycleTime - ws.cycleTime) / bottleneckCycleTime) * 100
          : 0;
          
        // Determine if this is a critical workstation (bottleneck or close to it)
        const isCritical = ws.cycleTime >= bottleneckCycleTime * 0.95;
        
        return {
          ...ws,
          idleTime,
          isCritical
        };
      });
      
      // Calculate total time by activity type
      let totalManualTime = 0;
      let totalMachineTime = 0;
      
      workstationsWithIdleTime.forEach(ws => {
        ws.activities.forEach(act => {
          if (act.type === 'Manual') {
            totalManualTime += act.cycleTime;
          } else {
            totalMachineTime += act.cycleTime;
          }
        });
      });
      
      return {
        lineId: line.id,
        lineName: line.name,
        cycleTime: bottleneckCycleTime,
        uph: lineUph,
        workstations: workstationsWithIdleTime,
        totalManualTime,
        totalMachineTime
      };
    });
    
    // Update the results
    setCalculationResults(results);
    
    // Calculate and update shifts metrics
    if (results.length > 0) {
      const highestUPH = Math.max(...results.map(r => r.uph), 0);
      const updatedShifts = study.shifts.map(shift => {
        // Calculate takt time in seconds
        const shiftSeconds = shift.hours * 3600;
        const taktTime = study.dailyDemand && study.dailyDemand > 0 
          ? shiftSeconds / study.dailyDemand
          : 0;
          
        // Calculate estimated production
        const estimatedProduction = shift.isActive ? Math.floor(highestUPH * shift.hours) : 0;
        
        return {
          ...shift,
          taktTime,
          estimatedProduction
        };
      });
    }
  }, [study]);

  if (study.productionLines.length === 0) {
    return (
      <Alert className="mb-6">
        <AlertTitle>Nenhuma linha cadastrada</AlertTitle>
        <AlertDescription>
          Adicione ao menos uma linha de produção com postos de trabalho e atividades para visualizar os cálculos.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {calculationResults.map((result) => (
        <Card key={result.lineId} className="overflow-hidden">
          <CardHeader>
            <CardTitle>{result.lineName}</CardTitle>
            <CardDescription>Cálculos e métricas de produção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Cycle Time Total</div>
                  <div className="text-2xl font-bold">{result.cycleTime.toFixed(2)} seg</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">UPH da Linha</div>
                  <div className="text-2xl font-bold">{result.uph} un/h</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Divisão de Tempo</div>
                  <div className="text-2xl font-bold">
                    {result.totalManualTime > 0 || result.totalMachineTime > 0 ? (
                      <>
                        {Math.round((result.totalManualTime / (result.totalManualTime + result.totalMachineTime)) * 100)}% / {Math.round((result.totalMachineTime / (result.totalManualTime + result.totalMachineTime)) * 100)}%
                      </>
                    ) : '0% / 0%'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Manual / Máquina</div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Posto</TableHead>
                    <TableHead>Cycle Time</TableHead>
                    <TableHead>UPH</TableHead>
                    <TableHead>Ociosidade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.workstations.map((ws) => (
                    <TableRow key={ws.id} className={ws.isCritical ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell className="font-medium">
                        {ws.number}
                        {ws.name && <span className="text-xs block text-muted-foreground">{ws.name}</span>}
                      </TableCell>
                      <TableCell>{ws.cycleTime.toFixed(2)} seg</TableCell>
                      <TableCell>{ws.uph}</TableCell>
                      <TableCell>
                        {ws.idleTime > 0 ? (
                          <div className={`${ws.idleTime > 30 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                            {ws.idleTime.toFixed(1)}%
                            {ws.idleTime > 30 && ' ⚠️'}
                          </div>
                        ) : '0%'}
                      </TableCell>
                      <TableCell>
                        {ws.isCritical ? (
                          <span className="text-red-600 dark:text-red-400 font-medium">Gargalo</span>
                        ) : (
                          <span className="text-green-600 dark:text-green-400">OK</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Detalhamento de Atividades</h3>
                {result.workstations.map((ws) => (
                  <Card key={ws.id} className="overflow-hidden">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">
                        Posto {ws.number} {ws.name && `- ${ws.name}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Atividade</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Tempo Médio</TableHead>
                            <TableHead>Cycle Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ws.activities.map((act) => (
                            <TableRow key={act.id}>
                              <TableCell>{act.description}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  act.type === 'Manual' 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                }`}>
                                  {act.type}
                                </span>
                              </TableCell>
                              <TableCell>{act.averageNormalTime.toFixed(2)} seg</TableCell>
                              <TableCell>{act.cycleTime.toFixed(2)} seg</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {calculationResults.length === 0 && (
        <Alert>
          <AlertTitle>Dados insuficientes</AlertTitle>
          <AlertDescription>
            Adicione atividades com tempos de coleta aos postos de trabalho para visualizar os cálculos.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
