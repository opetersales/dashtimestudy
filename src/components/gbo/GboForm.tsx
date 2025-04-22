
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GBO } from '@/utils/types';

interface GboFormProps {
  initialData?: Partial<GBO>;
  onSubmit: (data: Partial<GBO>) => void;
  onCancel: () => void;
}

export function GboForm({ initialData, onSubmit, onCancel }: GboFormProps) {
  const [formData, setFormData] = React.useState<Partial<GBO>>(
    initialData || {
      name: '',
      productModel: '',
      productVariant: '',
      productionLine: '',
      version: '1.0',
      status: 'draft',
      targetUPH: 0,
      cycleTime: 0,
      operatorCount: 0,
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'targetUPH' || name === 'cycleTime' || name === 'operatorCount' 
        ? parseInt(value, 10) 
        : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do GBO</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nome descritivo do GBO"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="productModel">Modelo do Produto</Label>
          <Input
            id="productModel"
            name="productModel"
            value={formData.productModel}
            onChange={handleChange}
            placeholder="Modelo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="productVariant">Variante do Produto</Label>
          <Input
            id="productVariant"
            name="productVariant"
            value={formData.productVariant}
            onChange={handleChange}
            placeholder="Variante (opcional)"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="productionLine">Linha de Produção</Label>
          <Select
            value={formData.productionLine}
            onValueChange={(value) => handleSelectChange('productionLine', value)}
          >
            <SelectTrigger id="productionLine">
              <SelectValue placeholder="Selecione a linha de produção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Line01">Linha 01</SelectItem>
              <SelectItem value="Line02">Linha 02</SelectItem>
              <SelectItem value="Line03">Linha 03</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value as any)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="archived">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetUPH">UPH Alvo</Label>
          <Input
            id="targetUPH"
            name="targetUPH"
            type="number"
            value={formData.targetUPH}
            onChange={handleChange}
            min={0}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cycleTime">Tempo de Ciclo (s)</Label>
          <Input
            id="cycleTime"
            name="cycleTime"
            type="number"
            value={formData.cycleTime}
            onChange={handleChange}
            min={0}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="operatorCount">Número de Operadores</Label>
          <Input
            id="operatorCount"
            name="operatorCount"
            type="number"
            value={formData.operatorCount}
            onChange={handleChange}
            min={0}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  );
}
