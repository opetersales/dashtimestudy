
import React from 'react';
import { WorkstationMetric } from '@/shared/hooks/useWorkstationMetrics';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';

interface BalancingTableProps {
  workstationMetrics: WorkstationMetric[];
}

/**
 * Componente para exibição de sugestões para balanceamento de linha
 */
export const BalancingTable: React.FC<BalancingTableProps> = ({ workstationMetrics }) => {
  return (
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
  );
};
