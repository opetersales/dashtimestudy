
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
import { ProductionLine } from '@/utils/types';

// Form schema validation
const lineFormSchema = z.object({
  name: z.string().min(1, { message: 'Nome da linha é obrigatório' }),
  notes: z.string().optional(),
});

type LineFormValues = z.infer<typeof lineFormSchema>;

interface ProductionLineFormProps {
  onSubmit: (data: Partial<ProductionLine>) => void;
  onCancel: () => void;
  initialData?: Partial<ProductionLine>;
}

export function ProductionLineForm({ onSubmit, onCancel, initialData }: ProductionLineFormProps) {
  const defaultValues: Partial<LineFormValues> = {
    name: initialData?.name || '',
    notes: initialData?.notes || '',
  };

  const form = useForm<LineFormValues>({
    resolver: zodResolver(lineFormSchema),
    defaultValues,
  });

  const handleFormSubmit = (data: LineFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Linha</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Linha 01" {...field} />
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
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Observações gerais sobre a linha de produção" 
                  className="resize-none" 
                  rows={4}
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
            Salvar Linha
          </Button>
        </div>
      </form>
    </Form>
  );
}
