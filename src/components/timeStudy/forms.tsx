
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductionLine, Workstation, Activity, Shift } from '@/utils/types';

// Form schemas
const productionLineSchema = z.object({
  name: z.string().min(1, "Nome da linha é obrigatório"),
  notes: z.string().optional(),
});

const workstationSchema = z.object({
  number: z.string().min(1, "Número do posto é obrigatório"),
  name: z.string().min(1, "Nome do posto é obrigatório"),
  notes: z.string().optional(),
});

const activitySchema = z.object({
  description: z.string().min(1, "Descrição da atividade é obrigatória"),
  type: z.enum(["Manual", "Maquinário"], {
    required_error: "Tipo de atividade é obrigatório",
  }),
  pfdFactor: z.coerce.number().min(0, "Fator PF&D não pode ser negativo").max(1, "Fator PF&D não pode ser maior que 1"),
});

const shiftSchema = z.object({
  name: z.string().min(1, "Nome do turno é obrigatório"),
  hours: z.coerce.number().positive("Horas devem ser positivas"),
  isActive: z.boolean().default(true),
});

// Production Line Form
interface ProductionLineFormProps {
  onSubmit: (data: ProductionLine) => void;
  onCancel?: () => void;
  initialData?: ProductionLine | null;
}

export const ProductionLineForm: React.FC<ProductionLineFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData 
}) => {
  const form = useForm<z.infer<typeof productionLineSchema>>({
    resolver: zodResolver(productionLineSchema),
    defaultValues: {
      name: initialData?.name || '',
      notes: initialData?.notes || '',
    },
  });

  const handleSubmit = (data: z.infer<typeof productionLineSchema>) => {
    const formattedData: ProductionLine = {
      id: initialData?.id || `line-${Date.now()}`,
      name: data.name,
      notes: data.notes || '',
      workstations: initialData?.workstations || [],
    };
    
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Linha</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Linha de Montagem 1" {...field} />
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
                <Textarea placeholder="Observações sobre a linha..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit">
            {initialData ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Workstation Form
interface WorkstationFormProps {
  onSubmit: (data: Workstation) => void;
  onCancel?: () => void;
  initialData?: Workstation | null;
}

export const WorkstationForm: React.FC<WorkstationFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData 
}) => {
  const form = useForm<z.infer<typeof workstationSchema>>({
    resolver: zodResolver(workstationSchema),
    defaultValues: {
      number: initialData?.number || '',
      name: initialData?.name || '',
      notes: initialData?.notes || '',
    },
  });

  const handleSubmit = (data: z.infer<typeof workstationSchema>) => {
    const formattedData: Workstation = {
      id: initialData?.id || `ws-${Date.now()}`,
      number: data.number,
      name: data.name,
      notes: data.notes || '',
      activities: initialData?.activities || [],
    };
    
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do Posto</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Nome do Posto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Montagem de Componente X" {...field} />
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
                <Textarea placeholder="Observações sobre o posto..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit">
            {initialData ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Activity Form
interface ActivityFormProps {
  onSubmit: (data: Activity) => void;
  onCancel?: () => void;
  initialData?: Activity | null;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData 
}) => {
  const form = useForm<z.infer<typeof activitySchema>>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      description: initialData?.description || '',
      type: (initialData?.type as "Manual" | "Maquinário") || 'Manual',
      pfdFactor: initialData?.pfdFactor || 0.1,
    },
  });

  const handleSubmit = (data: z.infer<typeof activitySchema>) => {
    const formattedData: Activity = {
      id: initialData?.id || `act-${Date.now()}`,
      description: data.description,
      type: data.type,
      pfdFactor: data.pfdFactor,
      collections: initialData?.collections || [],
    };
    
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição da Atividade</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Montagem de componente" {...field} />
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
              <FormLabel>Tipo de Atividade</FormLabel>
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
                />
              </FormControl>
              <FormDescription>
                Fator de fadiga e necessidades pessoais (geralmente entre 0 e 0.15)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit">
            {initialData ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

// Shift Form
interface ShiftFormProps {
  onSubmit: (data: Shift) => void;
  onCancel?: () => void;
  initialData?: Shift | null;
}

export const ShiftForm: React.FC<ShiftFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData 
}) => {
  const form = useForm<z.infer<typeof shiftSchema>>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      name: initialData?.name || '',
      hours: initialData?.hours || 8,
      isActive: initialData?.isActive ?? true,
    },
  });

  const handleSubmit = (data: z.infer<typeof shiftSchema>) => {
    const formattedData: Shift = {
      id: initialData?.id || `shift-${Date.now()}`,
      name: data.name,
      hours: data.hours,
      isActive: data.isActive,
    };
    
    onSubmit(formattedData);
  };

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
                <Input placeholder="Ex: Manhã" {...field} />
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
              <FormLabel>Horas de Trabalho</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1" 
                  max="24" 
                  step="0.5" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Duração do turno em horas
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
                  Este turno está atualmente em operação
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit">
            {initialData ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
