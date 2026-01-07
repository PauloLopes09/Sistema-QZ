
export enum TenderStatus {
  TRIAGEM = 'Triagem',
  AGUARDANDO_DISPUTA = 'Aguardando Disputa',
  EM_DISPUTA = 'Em Disputa',
  HABILITACAO = 'Habilitação',
  RECURSO = 'Recurso',
  HOMOLOGACAO = 'Homologação',
  SUSPENSO = 'Suspenso'
}

export type BidType = 'Valor' | 'Desconto';
export type LotType = 'Unico' | 'Multiplos';

export interface Lot {
  id: string;
  numero: string;
  colocacao: string;
  descricao?: string;
  valorOfertado?: number;
}

export interface Tender {
  id: string;
  empresa: string;
  orgaoLicitante: string;
  numeroEdital: string;
  portal: string;
  objeto: string;
  categoria: string;
  situacao: string;
  dataAbertura: string;
  horarioSessao: string;
  modoDisputa: string;
  prazoImpugnacao: string;
  prazoEsclarecimento: string;
  responsavel: string;
  valorReferencia: number;
  validadeProposta: string;
  exigeGarantia: boolean;
  valorGarantia?: number;
  propostaEnviada: boolean;
  tipoLicitacao: BidType;
  valorMinimo?: number;
  percentualDesconto?: number;
  statusAtual: TenderStatus;
  posicaoAtual: string; // Para lote único
  faseAtual: string;
  tipoLote: LotType;
  lotes: Lot[];
  dataRetorno?: string;
  horarioRetorno?: string;
  observacoesPregao?: string;
  observacoes: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  data: string;
  usuario: string;
  acao: string;
}

export interface DynamicLists {
  empresas: string[];
  portais: string[];
  categorias: string[];
  situacoes: string[];
  modosDisputa: string[];
  responsaveis: string[];
  statusAtual: string[];
  posicoes: string[];
  fasesProcesso: string[];
}
