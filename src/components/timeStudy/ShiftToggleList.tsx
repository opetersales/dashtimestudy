
import React from 'react';
import { Shift } from '@/utils/types';
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ShiftToggleListProps {
  shifts: Shift[];
  onShiftToggle?: (shiftId: string, isActive: boolean) => void;
  onEdit?: (shift: any) => void;
  onDelete?: (shiftId: string) => void;
}

export function ShiftToggleList({ shifts, onShiftToggle, onEdit, onDelete }: ShiftToggleListProps) {
  const handleToggle = (shift: Shift) => {
    if (onShiftToggle) {
      onShiftToggle(shift.id, !shift.isActive);
      toast({
        description: `Turno ${shift.name} ${!shift.isActive ? 'ativado' : 'desativado'} com sucesso.`,
      });
    }
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
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={() => onEdit(shift)} aria-label={`Editar turno ${shift.name}`}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={() => onDelete(shift.id)} aria-label={`Excluir turno ${shift.name}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {onShiftToggle && (
                <Switch
                  checked={shift.isActive}
                  onCheckedChange={() => handleToggle(shift)}
                  aria-label={`Ativar/Desativar turno ${shift.name}`}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
