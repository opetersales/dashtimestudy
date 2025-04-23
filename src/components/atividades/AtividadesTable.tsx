
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Pencil, Trash2 } from 'lucide-react';
import { Atividade } from '@/pages/AnaliseAtividades';
import * as XLSX from 'xlsx';

interface AtividadesTableProps {
  atividades: Atividade[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AtividadesTable({ atividades, onEdit, onDelete }: AtividadesTableProps) {
  const handleEdit = (id: string) => {
    // Add edit parameter to URL and trigger the callback
    const url = new URL(window.location.href);
    url.searchParams.set('edit', id);
    window.history.replaceState({}, '', url.toString());
    onEdit(id);
  };

  const handleExportExcel = () => {
    // Prepare data for export
    const data = atividades.map(atividade => ({
      Posto: atividade.posto,
      Atividade: atividade.descricao,
      'Cycle Time (s)': atividade.cycleTime,
      'Fadiga (%)': atividade.fadiga,
      'Cycle Time Ajustado (s)': atividade.cycleTimeAjustado,
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    const wscols = [
      { wch: 15 }, // Posto
      { wch: 40 }, // Atividade
      { wch: 15 }, // Cycle Time
      { wch: 15 }, // Fadiga
      { wch: 20 }, // Cycle Time Ajustado
    ];
    ws['!cols'] = wscols;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Atividades');
    
    // Generate file and trigger download
    XLSX.writeFile(wb, 'atividades_gbo.xlsx');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tabela de Atividades</CardTitle>
          <CardDescription>Gerencie as atividades cadastradas no GBO</CardDescription>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleExportExcel}
          disabled={atividades.length === 0}
        >
          <FileText className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </CardHeader>
      
      <CardContent>
        {atividades.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Nenhuma atividade cadastrada. Adicione atividades para visualizar a tabela.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Posto</TableHead>
                  <TableHead className="hidden sm:table-cell">Atividade</TableHead>
                  <TableHead>Cycle Time (s)</TableHead>
                  <TableHead>Fadiga (%)</TableHead>
                  <TableHead>Cycle Time Ajustado (s)</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {atividades.map((atividade) => (
                  <TableRow key={atividade.id}>
                    <TableCell>{atividade.posto}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="max-w-[300px] truncate" title={atividade.descricao}>
                        {atividade.descricao}
                      </div>
                    </TableCell>
                    <TableCell>{atividade.cycleTime.toFixed(2)}</TableCell>
                    <TableCell>{atividade.fadiga.toFixed(1)}%</TableCell>
                    <TableCell>{atividade.cycleTimeAjustado.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEdit(atividade.id)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete(atividade.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
