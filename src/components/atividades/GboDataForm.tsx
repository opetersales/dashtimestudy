
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GboData } from '@/pages/AnaliseAtividades';

interface GboDataFormProps {
  initialData: GboData;
  onSubmit: (data: GboData) => void;
}

export function GboDataForm({ initialData, onSubmit }: GboDataFormProps) {
  const [formData, setFormData] = React.useState<GboData>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleTurnoChange = (value: string) => {
    setFormData({
      ...formData,
      turno: value as 'Manhã' | 'Tarde' | 'Noite',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de GBO</CardTitle>
        <CardDescription>
          Preencha os dados gerais do GBO para análise de atividades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                name="cliente"
                value={formData.cliente}
                onChange={handleChange}
                placeholder="Nome do cliente"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                placeholder="Modelo do produto"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                name="data"
                type="date"
                value={formData.data}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="autor">Autor</Label>
              <Input
                id="autor"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                placeholder="Nome do autor"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="horasTrabalhadas">Horas Trabalhadas</Label>
              <Input
                id="horasTrabalhadas"
                name="horasTrabalhadas"
                type="number"
                min="0"
                step="0.5"
                value={formData.horasTrabalhadas}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="turno">Turno</Label>
              <Select 
                value={formData.turno} 
                onValueChange={handleTurnoChange}
              >
                <SelectTrigger id="turno">
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manhã">Manhã</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Noite">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit">Salvar Dados do GBO</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
