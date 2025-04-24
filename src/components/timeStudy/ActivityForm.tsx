
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Activity, TimeCollection } from '@/utils/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash } from 'lucide-react';

// Form schema validation
const activityFormSchema = z.object({
  description: z.string().min(1, { message: 'Descrição da atividade é obrigatória' }),
  type: z.enum(['Manual', 'Maquinário']),
  pfdFactor: z.number().min(0).max(0.5).default(0.1),
  // Collections will be handled separately
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

interface ActivityFormProps {
  onSubmit: (data: Partial<Activity>) => void;
  onCancel: () => void;
  initialData?: Partial<Activity>;
}

export function ActivityForm({ onSubmit, onCancel, initialData }: ActivityFormProps) {
  const [collections, setCollections] = useState<TimeCollection[]>(
    initialData?.collections || []
  );

  const defaultValues: Partial<ActivityFormValues> = {
    description: initialData?.description || '',
    type: initialData?.type || 'Manual',
    pfdFactor: initialData?.pfdFactor !== undefined ? initialData.pfdFactor : 0.1,
  };

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues,
  });

  const addCollection = () => {
    if (collections.length < 10) {
      setCollections([
        ...collections,
        { id: `col-${Date.now()}`, value: 0 }
      ]);
    }
  };

  const removeCollection = (id: string) => {
    setCollections(collections.filter(col => col.id !== id));
  };

  const updateCollectionValue = (id: string, value: number) => {
    setCollections(
      collections.map(col => 
        col.id === id ? { ...col, value } : col
      )
    );
  };

  const handleFormSubmit = (data: ActivityFormValues) => {
    onSubmit({
      ...data,
      collections,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da Atividade</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Montar componente X" {...field} />
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
              <FormLabel>Tipo da Atividade</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Manual">Manual (Hand)</SelectItem>
                  <SelectItem value="Maquinário">Maquinário (Mach)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pfdFactor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fator PF&D ({Math.round(field.value * 100)}%)</FormLabel>
              <FormControl>
                <Slider 
                  defaultValue={[field.value * 100]} 
                  min={0} 
                  max={50} 
                  step={1}
                  onValueChange={(vals) => {
                    field.onChange(vals[0] / 100);
                  }}
                />
              </FormControl>
              <FormDescription>
                Ajuste para perdas, fadiga e demora (0-50%)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Tempos de Coleta</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addCollection}
              disabled={collections.length >= 10}
            >
              <Plus className="mr-1 h-3 w-3" />
              Adicionar Coleta
            </Button>
          </div>

          {collections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Adicione ao menos uma coleta de tempo
            </p>
          ) : (
            <div className="space-y-2">
              {collections.map((collection, index) => (
                <div key={collection.id} className="flex items-center gap-2">
                  <div className="flex-grow">
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      Coleta {index + 1} (segundos)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={collection.value}
                      onChange={(e) => updateCollectionValue(collection.id, parseFloat(e.target.value) || 0)}
                      placeholder="Tempo em segundos"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-5"
                    onClick={() => removeCollection(collection.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={collections.length === 0}>
            Salvar Atividade
          </Button>
        </div>
      </form>
    </Form>
  );
}
