
import React, { useState } from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { useToast } from '@/components/ui/use-toast';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlanningEvent {
  id: string;
  title: string;
  date: string;
  type: 'review' | 'implementation' | 'training' | 'update';
  status: 'pending' | 'scheduled' | 'completed' | 'canceled' | 'draft';
  description: string;
  responsiblePerson?: string;
  estimatedHours?: number;
}

const Planning = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<PlanningEvent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // Load events from localStorage
  const [events, setEvents] = useState<PlanningEvent[]>(() => {
    const savedEvents = loadFromLocalStorage<PlanningEvent[]>('planningEvents', []);
    if (savedEvents.length === 0) {
      // Create mock data
      const today = new Date();
      const mockEvents: PlanningEvent[] = [
        { 
          id: '1', 
          title: 'Revisão GBO Linha 01', 
          date: today.toISOString(), 
          type: 'review', 
          status: 'pending',
          description: 'Revisão completa do GBO da Linha 01 para identificar melhorias.' 
        },
        { 
          id: '2', 
          title: 'Implantação modelo XYZ', 
          date: new Date(today.getTime() + 86400000).toISOString(), 
          type: 'implementation', 
          status: 'scheduled',
          description: 'Implantação do novo modelo XYZ na linha de produção.' 
        },
        { 
          id: '3', 
          title: 'Treinamento operadores', 
          date: new Date(today.getTime() + 172800000).toISOString(), 
          type: 'training', 
          status: 'scheduled',
          description: 'Treinamento de novos operadores no processo de montagem.' 
        },
        { 
          id: '4', 
          title: 'Atualização padrões', 
          date: new Date(today.getTime() + 259200000).toISOString(), 
          type: 'update', 
          status: 'draft',
          description: 'Atualização dos padrões de trabalho conforme novas diretrizes.' 
        },
      ];
      return mockEvents;
    }
    return savedEvents;
  });

  // Get events for the selected date
  const eventsForSelectedDate = events.filter(
    event => date && isSameDay(new Date(event.date), date)
  );

  // Function to handle form submission
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const eventData = {
      title: formData.get('title') as string,
      date: formData.get('date') as string,
      type: formData.get('type') as 'review' | 'implementation' | 'training' | 'update',
      status: formData.get('status') as 'pending' | 'scheduled' | 'completed' | 'canceled' | 'draft',
      description: formData.get('description') as string,
      responsiblePerson: formData.get('responsiblePerson') as string,
      estimatedHours: parseFloat(formData.get('estimatedHours') as string) || 0
    };
    
    if (eventToEdit) {
      // Update existing event
      const updatedEvents = events.map(event => 
        event.id === eventToEdit.id 
          ? { ...eventToEdit, ...eventData }
          : event
      );
      setEvents(updatedEvents);
      saveToLocalStorage('planningEvents', updatedEvents);
      toast({
        title: "Evento atualizado",
        description: "O evento foi atualizado com sucesso.",
      });
    } else {
      // Create new event
      const newEvent: PlanningEvent = {
        id: `event-${Date.now()}`,
        ...eventData
      };
      
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      saveToLocalStorage('planningEvents', updatedEvents);
      
      toast({
        title: "Evento criado",
        description: "O evento foi criado com sucesso.",
      });
    }
    
    setIsFormOpen(false);
    setEventToEdit(null);
  };

  // Function to handle event edit
  const handleEditEvent = (event: PlanningEvent) => {
    setEventToEdit(event);
    setIsFormOpen(true);
  };

  // Function to confirm event deletion
  const confirmDeleteEvent = (id: string) => {
    setEventToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Function to delete event
  const handleDeleteEvent = () => {
    if (eventToDelete) {
      const updatedEvents = events.filter(event => event.id !== eventToDelete);
      setEvents(updatedEvents);
      saveToLocalStorage('planningEvents', updatedEvents);
      toast({
        title: "Evento removido",
        description: "O evento foi removido com sucesso.",
      });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  // Function to get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'outline'; // Changed from 'success' to 'outline'
      case 'canceled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Function to get status display name
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluído';
      case 'canceled':
        return 'Cancelado';
      default:
        return 'Rascunho';
    }
  };

  // Function to get event type badge variant
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'review':
        return 'default';
      case 'implementation':
        return 'secondary';
      case 'training':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Function to get event type display name
  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'review':
        return 'Revisão';
      case 'implementation':
        return 'Implantação';
      case 'training':
        return 'Treinamento';
      default:
        return 'Atualização';
    }
  };

  // Function to open form for new event
  const openNewEventForm = () => {
    setEventToEdit(null);
    setIsFormOpen(true);
  };

  // Create a date marker for the Calendar
  const dateClass = (date: Date) => {
    return events.some(event => isSameDay(new Date(event.date), date))
      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground"
      : undefined;
  };

  return (
    <BasePage title="Planejamento">
      <div className="flex justify-end mb-4">
        <Button onClick={openNewEventForm}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="upcoming">Próximos Eventos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calendário de Atividades</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  locale={ptBR}
                  modifiers={{
                    booked: (date) => events.some(event => 
                      isSameDay(new Date(event.date), date)
                    )
                  }}
                  modifiersClassNames={{
                    booked: "border-2 border-primary"
                  }}
                  weekStartsOn={0}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-lg">Atividades do Dia</CardTitle>
                <Button variant="outline" size="sm" onClick={openNewEventForm}>
                  <Plus className="mr-2 h-3 w-3" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent>
                {eventsForSelectedDate.length > 0 ? (
                  <div className="space-y-3">
                    {eventsForSelectedDate.map(event => (
                      <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <p className="font-medium">{event.title}</p>
                            <Badge variant={getTypeBadgeVariant(event.type)}>
                              {getTypeDisplayName(event.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.responsiblePerson && `Responsável: ${event.responsiblePerson}`}
                            {event.estimatedHours ? ` • ${event.estimatedHours}h` : ''}
                          </p>
                          <p className="text-sm mt-1 line-clamp-2">{event.description}</p>
                          <div className="mt-2">
                            <Badge variant={getStatusBadgeVariant(event.status)}>
                              {getStatusDisplayName(event.status)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex ml-4 space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditEvent(event)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive"
                            onClick={() => confirmDeleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">
                    Nenhuma atividade para este dia
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events
                  .filter(event => new Date(event.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg group relative">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{event.title}</p>
                        <Badge variant={getTypeBadgeVariant(event.type)}>
                          {getTypeDisplayName(event.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                      {event.responsiblePerson && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Responsável: {event.responsiblePerson}
                        </p>
                      )}
                      <Badge 
                        className="mt-2"
                        variant={getStatusBadgeVariant(event.status)}
                      >
                        {getStatusDisplayName(event.status)}
                      </Badge>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditEvent(event)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive"
                        onClick={() => confirmDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {events.filter(event => new Date(event.date) >= new Date()).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Não há eventos futuros agendados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{eventToEdit ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input 
                id="title" 
                name="title" 
                defaultValue={eventToEdit?.title || ''} 
                placeholder="Título do evento"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <input 
                  type="hidden" 
                  name="date" 
                  value={eventToEdit?.date || date?.toISOString() || new Date().toISOString()} 
                />
                <DatePicker 
                  date={eventToEdit?.date ? new Date(eventToEdit.date) : date}
                  onSelect={(newDate) => {
                    if (newDate) {
                      if (eventToEdit) {
                        setEventToEdit({
                          ...eventToEdit,
                          date: newDate.toISOString()
                        });
                      } else {
                        setDate(newDate);
                      }
                    }
                  }} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsiblePerson">Responsável</Label>
                <Input 
                  id="responsiblePerson" 
                  name="responsiblePerson" 
                  defaultValue={eventToEdit?.responsiblePerson || ''} 
                  placeholder="Nome do responsável"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Evento</Label>
                <Select 
                  name="type" 
                  defaultValue={eventToEdit?.type || 'review'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review">Revisão</SelectItem>
                    <SelectItem value="implementation">Implantação</SelectItem>
                    <SelectItem value="training">Treinamento</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  name="status" 
                  defaultValue={eventToEdit?.status || 'scheduled'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="canceled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Horas Estimadas</Label>
              <Input 
                id="estimatedHours" 
                name="estimatedHours" 
                type="number" 
                min="0" 
                step="0.5"
                defaultValue={eventToEdit?.estimatedHours || ''} 
                placeholder="Duração estimada em horas"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={eventToEdit?.description || ''} 
                placeholder="Descrição detalhada do evento"
                rows={3}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {eventToEdit ? 'Salvar alterações' : 'Criar evento'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </BasePage>
  );
};

export default Planning;
