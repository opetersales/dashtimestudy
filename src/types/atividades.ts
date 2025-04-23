
export interface GboData {
  cliente: string;
  modelo: string;
  data: string;
  autor: string;
  horasTrabalhadas: number;
  turno: 'Manhã' | 'Tarde' | 'Noite';
}

export interface Atividade {
  id: string;
  posto: string;
  descricao: string;
  cycleTime: number;
  fadiga: number;
  cycleTimeAjustado: number;
}

export interface ChartData {
  posto: string;
  tempoTotal: number;
  uph: number;
  upph: number;
}

export interface PostoDetail {
  posto: string;
  atividades: {
    descricao: string;
    cycleTime: number;
    cycleTimeAjustado: number;
  }[];
}
