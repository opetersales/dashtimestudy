
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';
import { TimeStudy } from '@/utils/types';
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook para centralizar a lógica de exportação de estudos de tempo
 * Fornece funcionalidades para exportar estudos em formatos Excel e PDF
 */
export function useTimeStudyExport() {
  const { toast } = useToast();

  /**
   * Exporta os dados do estudo para um arquivo Excel
   * @param study Estudo de tempo a ser exportado
   * @returns Promise que resolve quando a exportação for concluída
   */
  const exportToExcel = async (study: TimeStudy): Promise<void> => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Informações Gerais
      const generalInfo = [{
        Cliente: study.client,
        Modelo: study.modelName,
        'Data do Estudo': new Date(study.studyDate).toLocaleDateString(),
        Responsável: study.responsiblePerson,
        'Demanda Mensal': study.monthlyDemand,
        'Dias Úteis': study.workingDays,
        'Demanda Diária': study.dailyDemand || 0,
        Status: study.status === 'active' ? 'Publicado' : 'Rascunho'
      }];
      const infoWs = XLSX.utils.json_to_sheet(generalInfo);
      XLSX.utils.book_append_sheet(workbook, infoWs, 'Informações');
      
      // Turnos
      const shiftsData = study.shifts.map(shift => ({
        Nome: shift.name,
        'Horas Trabalhadas': shift.hours,
        Ativo: shift.isActive ? 'Sim' : 'Não',
        'Takt Time': shift.taktTime || 'N/A'
      }));
      const shiftsWs = XLSX.utils.json_to_sheet(shiftsData);
      XLSX.utils.book_append_sheet(workbook, shiftsWs, 'Turnos');

      // Atividades
      const activitiesData: any[] = [];
      study.productionLines.forEach(line => {
        line.workstations.forEach(station => {
          station.activities.forEach(activity => {
            activitiesData.push({
              Linha: line.name,
              'Posto de Trabalho': station.number,
              Atividade: activity.description,
              Tipo: activity.type,
              'PF&D (%)': (activity.pfdFactor * 100).toFixed(1),
              'Média (s)': activity.averageNormalTime || 'N/A',
              'Tempo de Ciclo (s)': activity.cycleTime || 'N/A'
            });
          });
        });
      });
      const activitiesWs = XLSX.utils.json_to_sheet(activitiesData);
      XLSX.utils.book_append_sheet(workbook, activitiesWs, 'Atividades');

      // Exportar
      XLSX.writeFile(workbook, `estudo-${study.client}-${study.modelName}.xlsx`);
      
      toast({
        title: "Exportação concluída",
        description: "Arquivo Excel exportado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao exportar Excel:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o arquivo Excel.",
        variant: "destructive"
      });
      throw error;
    }
  };

  /**
   * Exporta os dados do estudo para um arquivo PDF
   * @param contentId ID do elemento HTML a ser exportado
   * @param filename Nome do arquivo PDF
   * @returns Promise que resolve quando a exportação for concluída
   */
  const exportToPDF = async (contentId: string, filename: string): Promise<void> => {
    try {
      const element = document.getElementById(contentId);
      
      if (!element) {
        toast({
          title: "Erro ao exportar",
          description: "Conteúdo não encontrado para exportação.",
          variant: "destructive"
        });
        throw new Error("Elemento não encontrado para exportação");
      }

      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "Exportação concluída",
        description: "PDF exportado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o PDF.",
        variant: "destructive"
      });
      throw error;
    }
  };

  /**
   * Exporta um estudo específico para PDF
   * @param study Estudo de tempo
   * @returns Promise que resolve quando a exportação for concluída
   */
  const exportStudyToPDF = async (study: TimeStudy): Promise<void> => {
    return exportToPDF(
      'study-content', 
      `estudo-${study.client}-${study.modelName}.pdf`
    );
  };

  return {
    exportToExcel,
    exportToPDF,
    exportStudyToPDF
  };
}
