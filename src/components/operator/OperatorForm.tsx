
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';

interface Operator {
  id: string;
  name: string;
  role: string;
  skills: string[];
  status: 'active' | 'training' | 'vacation' | 'inactive';
  workstation: string;
  hireDate?: string;
  certifications?: string[];
}

interface OperatorFormProps {
  initialData?: Partial<Operator>;
  onSubmit: (data: Partial<Operator>) => void;
  onCancel: () => void;
}

export function OperatorForm({ initialData, onSubmit, onCancel }: OperatorFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    role: initialData?.role || 'Operador Júnior',
    skills: initialData?.skills || [],
    status: initialData?.status || 'active',
    workstation: initialData?.workstation || '',
    hireDate: initialData?.hireDate || new Date().toISOString().split('T')[0],
    certifications: initialData?.certifications || [],
  });
  
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        hireDate: date.toISOString().split('T')[0]
      }));
    }
  };
  
  const addSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };
  
  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };
  
  const addCertification = () => {
    if (newCertification && !formData.certifications.includes(newCertification)) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification]
      }));
      setNewCertification('');
    }
  };
  
  const removeCertification = (certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== certification)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            placeholder="Nome do operador"
            required 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Cargo</Label>
            <Select 
              value={formData.role} 
              onValueChange={handleSelectChange('role')}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Operador Júnior">Operador Júnior</SelectItem>
                <SelectItem value="Operador Pleno">Operador Pleno</SelectItem>
                <SelectItem value="Operador Sênior">Operador Sênior</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={handleSelectChange('status')}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="training">Em Treinamento</SelectItem>
                <SelectItem value="vacation">Em Férias</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="workstation">Posto de Trabalho</Label>
          <Input 
            id="workstation" 
            name="workstation" 
            value={formData.workstation} 
            onChange={handleChange}
            placeholder="Linha ou posto atribuído"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hireDate">Data de Admissão</Label>
          <DatePicker 
            date={formData.hireDate ? new Date(formData.hireDate) : undefined}
            onSelect={handleDateChange} 
          />
        </div>
        
        <div className="space-y-2">
          <Label>Habilidades</Label>
          <div className="flex gap-2">
            <Input 
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Nova habilidade"
              className="flex-grow"
            />
            <Button type="button" onClick={addSkill}>
              Adicionar
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.map(skill => (
              <Badge key={skill} variant="secondary" className="pr-1 flex items-center">
                {skill}
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeSkill(skill)}
                  className="h-5 w-5 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Certificações</Label>
          <div className="flex gap-2">
            <Input 
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              placeholder="Nova certificação"
              className="flex-grow"
            />
            <Button type="button" onClick={addCertification}>
              Adicionar
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.certifications.map(certification => (
              <Badge key={certification} className="pr-1 flex items-center">
                {certification}
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeCertification(certification)}
                  className="h-5 w-5 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? 'Salvar alterações' : 'Cadastrar operador'}
        </Button>
      </div>
    </form>
  );
}
