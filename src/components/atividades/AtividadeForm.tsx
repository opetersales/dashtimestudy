
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Atividade } from '@/types/atividades';

interface AtividadeFormProps {
  atividades: Atividade[];
  onSubmit: (atividade: Atividade) => void;
}

export function AtividadeForm({ atividades, onSubmit }: AtividadeFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Atividade, 'id' | 'cycleTimeAjustado'>>({
    posto: '',
    descricao: '',
    cycleTime: 0,
    fadiga: 0,
  });
  
  useEffect(() => {
    // Observe URL parameters for edit mode
    const url = new URL(window.location.href);
    const id = url.searchParams.get('edit');
    if (id) {
      const atividade = atividades.find(a => a.id === id);
      if (atividade) {
        setEditingId(id);
        setFormData({
          posto: atividade.posto,
          descricao: atividade.descricao,
          cycleTime: atividade.cycleTime,
          fadiga: atividade.fadiga,
        });
      }
    }
  }, [atividades]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const calculateCycleTimeAjustado = (cycleTime: number, fadiga: number) => {
    return cycleTime * (1 + fadiga / 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cycleTimeAjustado = calculateCycleTimeAjustado(formData.cycleTime, formData.fadiga);
    
    const atividadeToSubmit: Atividade = {
      id: editingId || `atividade-${Date.now()}`,
      ...formData,
      cycleTimeAjustado,
    };
    
    onSubmit(atividadeToSubmit);
    
    // Reset form
    if (!editingId) {
      setFormData({
        posto: '',
        descricao: '',
        cycleTime: 0,
        fadiga: 0,
      });
    }
    setEditingId(null);
    
    // Remove edit parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    window.history.replaceState({}, '', url.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      posto: '',
      descricao: '',
      cycleTime: 0,
      fadiga: 0,
    });
    
    // Remove edit parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('edit');
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingId ? 'Editar Atividade' : 'Cadastro de Atividade'}</CardTitle>
        <CardDescription>
          {editingId 
            ? 'Atualize os detalhes desta atividade'
            : 'Adicione uma nova atividade ao seu GBO'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="posto">Posto</Label>
              <Input
                id="posto"
                name="posto"
                value={formData.posto}
                onChange={handleChange}
                placeholder="Nome do posto"
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descricao">Descrição da Atividade</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreva a atividade"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cycleTime">Cycle Time (segundos)</Label>
              <Input
                id="cycleTime"
                name="cycleTime"
                type="number"
                min="0"
                step="0.01"
                value={formData.cycleTime}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fadiga">Percentual de Fadiga (%)</Label>
              <Input
                id="fadiga"
                name="fadiga"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.fadiga}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2 border p-3 rounded-md bg-muted/20">
              <Label>Cycle Time Ajustado (calculado)</Label>
              <div className="font-mono text-lg">
                {calculateCycleTimeAjustado(formData.cycleTime, formData.fadiga).toFixed(2)} seg
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Fórmula: Cycle Time × (1 + Fadiga%)
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            {editingId && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancelEdit}
              >
                Cancelar
              </Button>
            )}
            <Button type="submit">
              {editingId ? 'Atualizar Atividade' : 'Adicionar Atividade'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
