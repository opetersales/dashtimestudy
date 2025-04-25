
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity } from '@/utils/types';

const MAX_COLLECTIONS = 10;

const activityFormSchema = z.object({
  stationNumber: z.string().min(1, "Número da estação é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  type: z.enum(["Manual", "Maquinário"], {
    required_error: "Tipo de trabalho é obrigatório",
  }),
  collections: z.array(z.number().min(0, "Tempo deve ser positivo"))
    .min(1, "Pelo menos uma coleta é necessária")
    .max(MAX_COLLECTIONS, `Máximo de ${MAX_COLLECTIONS} coletas permitidas`),
  pfdFactor: z.number()
    .min(0, "Fator PF&D deve ser positivo")
    .max(1, "Fator PF&D deve ser menor que 1"),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

interface ActivityFormProps {
  onSubmit: (data: Activity) => void;
  onCancel: () => void;
  initialData?: Activity;
}

export function ActivityForm({ onSubmit, onCancel, initialData }: ActivityFormProps) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      stationNumber: initialData?.stationNumber || '',
      description: initialData?.description || '',
      type: initialData?.type || 'Manual',
      collections: initialData?.collections || [0],
      pfdFactor: initialData?.pfdFactor || 0.1,
    },
  });

  const collectionsCount = form.watch('collections').length;

  const addCollection = () => {
    const currentCollections = form.getValues('collections');
    if (currentCollections.length < MAX_COLLECTIONS) {
      form.setValue('collections', [...currentCollections, 0]);
    }
  };

  const removeCollection = (index: number) => {
    const currentCollections = form.getValues('collections');
    form.setValue('collections', currentCollections.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="stationNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número da Estação</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: 01" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da Atividade</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Descreva a atividade" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Trabalho</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Maquinário">Maquinário</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Coletas de Tempo</FormLabel>
            {collectionsCount < MAX_COLLECTIONS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCollection}
              >
                Adicionar Coleta
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {form.watch('collections').map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`collections.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coleta {index + 1}</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeCollection(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="pfdFactor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fator PF&D</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Fator de fadiga e necessidades pessoais (entre 0 e 1)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {initialData ? 'Salvar' : 'Criar'} Atividade
          </Button>
        </div>
      </form>
    </Form>
  );
}
