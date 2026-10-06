export interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  pontosEstimados: number;
  dataPrazo: Date;
  concluida: boolean;
}
