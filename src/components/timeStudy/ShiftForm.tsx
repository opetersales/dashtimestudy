
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Shift } from '@/utils/types';

const shiftFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  hours: z
    .string()
    .min(1, 'Horas são obrigatórias')
    .refine(
      (value) => {
        // Aceitar tanto ponto quanto vírgula como separador decimal
        const normalizedValue = value.replace(',', '.');
        const parsedValue = parseFloat(normalizedValue);
        return !isNaN(parsedValue) && parsedValue > 0;
      },
      {
        message: 'Horas deve ser um número positivo',
      }
    ),
  isActive: z.boolean(),
});

type ShiftFormValues = z.infer<typeof shiftFormSchema>;

interface ShiftFormProps {
  onSubmit: (data: Shift) => void;
  onCancel: () => void;
  initialData?: Shift;
}

export function ShiftForm({ onSubmit, onCancel, initialData }: ShiftFormProps) {
  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      hours: initialData?.hours ? String(initialData.hours).replace('.', ',') : '',
      isActive: initialData?.isActive || true,
    },
  });

  function handleSubmit(values: ShiftFormValues) {
    const hoursValue = parseFloat(values.hours.replace(',', '.'));
    
    const shiftData: Shift = {
      id: initialData?.id || `shift-${Date.now()}`,
      name: values.name,
      hours: hoursValue,
      isActive: values.isActive,
    };
    
    onSubmit(shiftData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Turno</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Turno 1, Manhã, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horas Trabalhadas</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 8,5 ou 7,33" {...field} />
              </FormControl>
              <FormDescription>
                Você pode usar vírgula ou ponto como separador decimal
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Turno Ativo</FormLabel>
                <FormDescription>
                  Turnos ativos são considerados nos cálculos de produção
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? 'Atualizar' : 'Criar'} Turno
          </Button>
        </div>
      </form>
    </Form>
  );
}
