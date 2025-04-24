import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TimeStudy, Shift } from '@/utils/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Plus, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const timeStudyFormSchema = z.object({
  client: z.string().min(1, { message: 'Cliente é obrigatório' }),
  modelName: z.string().min(1, { message: 'Nome do modelo é obrigatório' }),
  responsiblePerson: z.string().min(1, { message: 'Responsável é obrigatório' }),
  studyDate: z.date({ required_error: 'Data do estudo é obrigatória' }),
  monthlyDemand: z.coerce.number().min(1, { message: 'Demanda mensal deve ser maior que zero' }),
  workingDays: z.coerce.number().min(1, { message: 'Dias úteis devem ser maior que zero' })
});

type TimeStudyFormValues = z.infer<typeof timeStudyFormSchema>;

interface TimeStudyFormProps {
  onSubmit: (data: Partial<TimeStudy>, isDraft: boolean) => void;
  onCancel: () => void;
  initialData?: Partial<TimeStudy>;
}

export function TimeStudyForm({ onSubmit, onCancel, initialData }: TimeStudyFormProps) {
  const [shifts, setShifts] = useState<Partial<Shift>[]>(initialData?.shifts || [
    { id: `shift-${Date.now()}`, name: '1º', hours: 7.33, isActive: true },
    { id: `shift-${Date.now() + 1}`, name: '2º', hours: 7.33, isActive: false },
    { id: `shift-${Date.now() + 2}`, name: '3º', hours: 7.00, isActive: false }
  ]);

  const defaultValues: Partial<TimeStudyFormValues> = {
    client: initialData?.client || '',
    modelName: initialData?.modelName || '',
    responsiblePerson: initialData?.responsiblePerson || '',
    studyDate: initialData?.studyDate ? new Date(initialData.studyDate) : new Date(),
    monthlyDemand: initialData?.monthlyDemand || 0,
    workingDays: initialData?.workingDays || 22,
  };

  const form = useForm<TimeStudyFormValues>({
    resolver: zodResolver(timeStudyFormSchema),
    defaultValues,
  });

  const calculateDailyDemand = (): number => {
    const monthlyDemand = form.getValues('monthlyDemand');
    const workingDays = form.getValues('workingDays');
    return monthlyDemand && workingDays ? Math.round(monthlyDemand / workingDays) : 0;
  };

  const updateShift = (index: number, field: keyof Shift, value: any) => {
    const updatedShifts = [...shifts];
    updatedShifts[index] = {
      ...updatedShifts[index],
      [field]: value
    };
    setShifts(updatedShifts);
  };

  const handleFormSubmit = (data: TimeStudyFormValues, isDraft: boolean = true) => {
    const dailyDemand = calculateDailyDemand();
    
    onSubmit({
      ...data,
      studyDate: data.studyDate.toISOString(),
      dailyDemand,
      shifts: shifts as Shift[],
      productionLines: [],
      status: isDraft ? 'draft' : 'active'
    }, isDraft);
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit((data) => handleFormSubmit(data, true))();
      }} className="space-y-6">
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
                <FormLabel>Nome do Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Modelo XYZ-123" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input placeholder="Nome do responsável" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: ptBR })
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
            name="monthlyDemand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Demanda Mensal</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} onChange={(e) => {
                    field.onChange(e);
                    form.trigger('monthlyDemand');
                  }} />
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
                <FormLabel>Dias Úteis no Mês</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="31" {...field} onChange={(e) => {
                    field.onChange(e);
                    form.trigger('workingDays');
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Demanda Diária:</p>
              <p className="font-medium">{calculateDailyDemand()} unidades</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Turnos de Trabalho</CardTitle>
            <CardDescription>Configure os turnos disponíveis para produção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shifts.map((shift, index) => (
                <div key={shift.id} className="flex items-center gap-4 p-4 border rounded-md">
                  <div className="flex items-center h-5">
                    <Checkbox 
                      id={`shift-${index}-active`}
                      checked={shift.isActive}
                      onCheckedChange={(checked) => updateShift(index, 'isActive', !!checked)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                    <div>
                      <label htmlFor={`shift-${index}-name`} className="text-sm font-medium">
                        Nome do Turno
                      </label>
                      <Input
                        id={`shift-${index}-name`}
                        value={shift.name}
                        onChange={(e) => updateShift(index, 'name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor={`shift-${index}-hours`} className="text-sm font-medium">
                        Horas Trabalhadas
                      </label>
                      <Input
                        id={`shift-${index}-hours`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={shift.hours}
                        onChange={(e) => updateShift(index, 'hours', parseFloat(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center mt-6">
                      <p className="text-sm text-muted-foreground">
                        {shift.isActive ? "Ativo" : "Inativo"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="button" variant="secondary" 
            onClick={() => form.handleSubmit((data) => handleFormSubmit(data, true))()}>
            Salvar Rascunho
          </Button>
          <Button type="button"
            onClick={() => form.handleSubmit((data) => handleFormSubmit(data, false))()}>
            Publicar Estudo
          </Button>
        </div>
      </form>
    </Form>
  );
}
