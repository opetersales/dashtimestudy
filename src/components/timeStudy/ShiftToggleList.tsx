
import React from 'react';
import { Shift } from '@/utils/types';
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface ShiftToggleListProps {
  shifts: Shift[];
  onShiftToggle: (shiftId: string, isActive: boolean) => void;
}

export function ShiftToggleList({ shifts, onShiftToggle }: ShiftToggleListProps) {
  const handleToggle = (shift: Shift) => {
    onShiftToggle(shift.id, !shift.isActive);
    toast({
      description: `Turno ${shift.name} ${!shift.isActive ? 'ativado' : 'desativado'} com sucesso.`,
    });
  };

  return (
    <div className="space-y-4">
      {shifts.map((shift) => (
        <Card key={shift.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">{shift.name}</div>
              <div className="text-sm text-muted-foreground">
                {shift.hours} horas
              </div>
            </div>
            <Switch
              checked={shift.isActive}
              onCheckedChange={() => handleToggle(shift)}
              aria-label={`Ativar/Desativar turno ${shift.name}`}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
