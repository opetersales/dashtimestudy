
import React from 'react';
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
import { Workstation } from '@/utils/types';

// Form schema validation
const workstationFormSchema = z.object({
  number: z.string().min(1, { message: 'Número do posto é obrigatório' }),
  name: z.string().optional(),
  notes: z.string().optional(),
});

type WorkstationFormValues = z.infer<typeof workstationFormSchema>;

interface WorkstationFormProps {
  onSubmit: (data: Partial<Workstation>) => void;
  onCancel: () => void;
  initialData?: Partial<Workstation>;
}

export function WorkstationForm({ onSubmit, onCancel, initialData }: WorkstationFormProps) {
  const defaultValues: Partial<WorkstationFormValues> = {
    number: initialData?.number || '',
    name: initialData?.name || '',
    notes: initialData?.notes || '',
  };

  const form = useForm<WorkstationFormValues>({
    resolver: zodResolver(workstationFormSchema),
    defaultValues,
  });

  const handleFormSubmit = (data: WorkstationFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do Posto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 01, 02, ..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Montagem da Base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações sobre este posto de trabalho" 
                  className="resize-none" 
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar Posto
          </Button>
        </div>
      </form>
    </Form>
  );
}
