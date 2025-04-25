
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

const timeStudySchema = z.object({
  client: z.string().min(1, "Cliente é obrigatório"),
  modelName: z.string().min(1, "Modelo é obrigatório"),
  studyDate: z.date({
    required_error: "Data do estudo é obrigatória",
  }),
  responsiblePerson: z.string().min(1, "Responsável é obrigatório"),
  monthlyDemand: z.coerce.number().min(1, "Demanda mensal é obrigatória"),
  workingDays: z.coerce.number().min(1, "Dias úteis são obrigatórios"),
});

type TimeStudyFormValues = z.infer<typeof timeStudySchema>;

interface TimeStudyFormProps {
  onSubmit: (data: TimeStudyFormValues, isDraft?: boolean) => void;
  onCancel?: () => void;
  isEdit?: boolean; // New prop to distinguish between create and edit modes
  initialData?: Partial<TimeStudyFormValues> & { studyDate?: Date | string };
}

export const TimeStudyForm = ({ onSubmit, onCancel, isEdit = false, initialData }: TimeStudyFormProps) => {
  const [activeTab, setActiveTab] = useState('general');

  // Process initialData to handle both Date and string types for studyDate
  const processedInitialData = initialData ? {
    ...initialData,
    studyDate: initialData.studyDate 
      ? initialData.studyDate instanceof Date 
        ? initialData.studyDate 
        : new Date(initialData.studyDate)
      : new Date()
  } : undefined;

  const form = useForm<TimeStudyFormValues>({
    resolver: zodResolver(timeStudySchema),
    defaultValues: {
      client: processedInitialData?.client || "",
      modelName: processedInitialData?.modelName || "",
      studyDate: processedInitialData?.studyDate || new Date(),
      responsiblePerson: processedInitialData?.responsiblePerson || "",
      monthlyDemand: processedInitialData?.monthlyDemand || undefined,
      workingDays: processedInitialData?.workingDays || 22,
    }
  });

  const handleSubmit = (data: TimeStudyFormValues) => {
    // In create mode, we just submit the data
    // The higher-level component will handle creating it as active or draft
    onSubmit(data);
  };
  
  const handleDraftSubmit = () => {
    const formData = form.getValues();
    if (Object.keys(form.formState.errors).length === 0) {
      onSubmit(formData, true);
    } else {
      form.trigger();
    }
  };
  
  const handlePublishSubmit = () => {
    const formData = form.getValues();
    if (Object.keys(form.formState.errors).length === 0) {
      onSubmit(formData, false);
    } else {
      form.trigger();
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="general">Informações Gerais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="client"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Cliente" 
                              {...field} 
                            />
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
                            <Input 
                              placeholder="Modelo" 
                              {...field} 
                            />
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
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: ptBR })
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
                                locale={ptBR}
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
                          <FormControl>
                            <Input 
                              placeholder="Responsável pelo estudo" 
                              {...field} 
                            />
                          </FormControl>
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
                            <Input 
                              placeholder="Ex: 1000" 
                              type="number"
                              {...field} 
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
                          <FormLabel>Dias Úteis</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: 22" 
                              type="number"
                              min={1}
                              max={31}
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Dias de trabalho no mês
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
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
                
                {/* In edit mode, show both draft and publish buttons */}
                {isEdit ? (
                  <>
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={handleDraftSubmit}
                    >
                      Salvar Rascunho
                    </Button>
                    <Button 
                      type="button" 
                      variant="default"
                      onClick={handlePublishSubmit}
                    >
                      Publicar Estudo
                    </Button>
                  </>
                ) : (
                  /* In create mode, just show a single Create button */
                  <Button type="submit">
                    Criar Estudo
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
};
