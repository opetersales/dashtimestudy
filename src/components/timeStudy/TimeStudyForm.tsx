import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TimeStudy, Shift } from '@/utils/types';
import { ShiftToggleList } from './ShiftToggleList';
import { ShiftForm } from './ShiftForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { loadFromLocalStorage } from '@/services/localStorage';

// Validation schema
const formSchema = z.object({
  client: z.string().min(1, "O cliente é obrigatório"),
  modelName: z.string().min(1, "O modelo é obrigatório"),
  studyDate: z.date(),
  responsiblePerson: z.string().min(1, "O responsável é obrigatório"),
  monthlyDemand: z.coerce.number().min(0, "A demanda mensal deve ser maior ou igual a zero"),
  workingDays: z.coerce.number().min(1, "Número de dias trabalhados deve ser maior que zero"),
});

interface TimeStudyFormProps {
  initialData?: Partial<TimeStudy>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEdit: boolean;
}

export const TimeStudyForm = ({ initialData, onSubmit, onCancel, isEdit }: TimeStudyFormProps) => {
  const [shifts, setShifts] = useState<any[]>(initialData?.shifts || []);
  const [isShiftFormOpen, setIsShiftFormOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<any | null>(null);

  // Convert string date to Date object for the form
  const initialDate = initialData?.studyDate ? new Date(initialData.studyDate) : new Date();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: initialData?.client || '',
      modelName: initialData?.modelName || '',
      studyDate: initialDate,
      responsiblePerson: initialData?.responsiblePerson || '', 
      monthlyDemand: initialData?.monthlyDemand || 0,
      workingDays: initialData?.workingDays || 22,
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    // Add the shifts to the data
    const submitData = {
      ...data,
      shifts,
    };
    onSubmit(submitData);
  };

  const handleAddShift = (shiftData: any) => {
    if (currentShift) {
      // Edit existing shift
      setShifts(shifts.map(shift => 
        shift.id === currentShift.id ? { ...shift, ...shiftData } : shift
      ));
    } else {
      // Add new shift
      const newShift = {
        id: `shift-${Date.now()}`,
        ...shiftData
      };
      setShifts([...shifts, newShift]);
    }
    setCurrentShift(null);
    setIsShiftFormOpen(false);
  };

  const handleEditShift = (shift: any) => {
    setCurrentShift(shift);
    setIsShiftFormOpen(true);
  };

  const handleDeleteShift = (shiftId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este turno?")) {
      setShifts(shifts.filter(s => s.id !== shiftId));
    }
  };

  // Helper to get current user name
  const getCurrentUserName = () => {
    const userData = loadFromLocalStorage('userData', { name: 'Usuário' });
    return userData.name;
  };

  // Helper to set "me" as responsible person
  const setMeAsResponsible = () => {
    form.setValue('responsiblePerson', getCurrentUserName());
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do modelo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="studyDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do Estudo</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "P", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responsiblePerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <div className="flex space-x-2">
                    <FormControl className="flex-grow">
                      <Input placeholder="Nome do responsável" {...field} />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={setMeAsResponsible}
                      className="whitespace-nowrap"
                    >
                      Eu
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="monthlyDemand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Demanda Mensal</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Quantidade" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        const monthlyDemand = parseInt(e.target.value);
                        const workingDays = form.getValues('workingDays');
                        if (monthlyDemand && workingDays) {
                          // Could calculate daily demand here if needed
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workingDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias Trabalhados por Mês</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Dias" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        const workingDays = parseInt(e.target.value);
                        const monthlyDemand = form.getValues('monthlyDemand');
                        if (monthlyDemand && workingDays) {
                          // Could calculate daily demand here if needed
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Turnos de Trabalho</h3>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setCurrentShift(null);
                  setIsShiftFormOpen(true);
                }}
              >
                Adicionar Turno
              </Button>
            </div>
            <ShiftToggleList 
              shifts={shifts} 
              onEdit={handleEditShift}
              onDelete={handleDeleteShift}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEdit ? 'Atualizar' : 'Criar'} Estudo
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={isShiftFormOpen} onOpenChange={setIsShiftFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentShift ? 'Editar' : 'Adicionar'} Turno</DialogTitle>
          </DialogHeader>
          <ShiftForm 
            initialData={currentShift} 
            onSubmit={handleAddShift} 
            onCancel={() => {
              setCurrentShift(null);
              setIsShiftFormOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
