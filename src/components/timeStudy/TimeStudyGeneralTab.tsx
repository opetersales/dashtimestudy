
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from "@/components/ui/switch";
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { TimeStudy, Shift } from '@/utils/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShiftForm } from './ShiftForm';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeStudyGeneralTabProps {
  study: TimeStudy;
  onStudyUpdate: (study: TimeStudy) => void;
}

export function TimeStudyGeneralTab({ study, onStudyUpdate }: TimeStudyGeneralTabProps) {
  const { toast } = useToast();
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);

  const handleShiftToggle = (shiftId: string) => {
    const updatedShifts = study.shifts.map(shift =>
      shift.id === shiftId ? { ...shift, isActive: !shift.isActive } : shift
    );
    
    onStudyUpdate({
      ...study,
      shifts: updatedShifts,
    });

    const toggledShift = study.shifts.find(s => s.id === shiftId);
    if (toggledShift) {
      toast({
        description: `Turno ${toggledShift.name} ${!toggledShift.isActive ? 'ativado' : 'desativado'} com sucesso.`,
      });
    }
  };

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setIsShiftDialogOpen(true);
  };

  const handleDeleteShift = (shiftId: string) => {
    const updatedShifts = study.shifts.filter(shift => shift.id !== shiftId);
    onStudyUpdate({
      ...study,
      shifts: updatedShifts,
    });
    toast({
      description: "Turno excluído com sucesso.",
    });
  };

  const handleShiftSubmit = (shiftData: Shift) => {
    let updatedShifts;
    if (editingShift) {
      updatedShifts = study.shifts.map(shift =>
        shift.id === editingShift.id ? { ...shiftData, id: shift.id } : shift
      );
    } else {
      updatedShifts = [...study.shifts, shiftData];
    }

    onStudyUpdate({
      ...study,
      shifts: updatedShifts,
    });

    setIsShiftDialogOpen(false);
    setEditingShift(null);
    toast({
      description: `Turno ${editingShift ? 'atualizado' : 'criado'} com sucesso.`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais</CardTitle>
          <CardDescription>Dados básicos do estudo de tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Cliente</dt>
              <dd className="mt-1 text-base">{study.client}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Modelo</dt>
              <dd className="mt-1 text-base">{study.modelName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Responsável</dt>
              <dd className="mt-1 text-base">{study.responsiblePerson}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Data do Estudo</dt>
              <dd className="mt-1 text-base">
                {format(new Date(study.studyDate), 'PPP', { locale: ptBR })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Demanda Mensal</dt>
              <dd className="mt-1 text-base">{study.monthlyDemand.toLocaleString()} unidades</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Dias Úteis</dt>
              <dd className="mt-1 text-base">{study.workingDays} dias</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Demanda Diária</dt>
              <dd className="mt-1 text-base">{study.dailyDemand?.toLocaleString() || 0} unidades</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Turnos</CardTitle>
            <CardDescription>Gerencie os turnos de trabalho</CardDescription>
          </div>
          <Button 
            onClick={() => {
              setEditingShift(null);
              setIsShiftDialogOpen(true);
            }}
            size="sm" 
            variant="secondary"
          >
            Adicionar Turno
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {study.shifts.map((shift) => (
              <div
                key={shift.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="space-y-1">
                  <p className="font-medium">{shift.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {shift.hours.toString().replace('.', ',')} horas
                    </p>
                    {shift.taktTime && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Takt: {shift.taktTime.toFixed(2)}s
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={shift.isActive}
                    onCheckedChange={() => handleShiftToggle(shift.id)}
                    aria-label={`Ativar ${shift.name}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditShift(shift)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteShift(shift.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {study.shifts.length === 0 && (
              <div className="text-center p-6 text-muted-foreground">
                Nenhum turno cadastrado. Clique em "Adicionar Turno" para começar.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingShift ? 'Editar' : 'Adicionar'} Turno</DialogTitle>
          </DialogHeader>
          <ShiftForm
            initialData={editingShift || undefined}
            onSubmit={handleShiftSubmit}
            onCancel={() => {
              setIsShiftDialogOpen(false);
              setEditingShift(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
