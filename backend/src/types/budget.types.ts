/**
 * Tipos de dominio da aplicacao de orcamento de manufatura aditiva.
 * Mantidos em espelho no frontend (src/types/budget.types.ts) ate que
 * o projeto passe a usar um pacote compartilhado (ver README - evolucoes futuras).
 */

export type FilamentKey =
  | "PLA"
  | "PETG"
  | "ABS"
  | "TPU"
  | "NYLON"
  | "RESINA"
  | "OUTROS";

export interface MaterialConfig {
  key: FilamentKey;
  name: string;
  pricePerKg: number;
  pricePerGram: number;
}

/** Tempo de impressao informado pelo operador, em horas e minutos. */
export interface PrintTime {
  hours: number;
  minutes: number;
}

export interface RequesterData {
  name: string;
  email: string;
  department?: string;
  projectDescription: string;
}

export interface PrintData {
  materialKey: FilamentKey;
  weightInGrams: number;
  printTime: PrintTime;
}

/** Um servico complementar (modelagem, escaneamento ou fatiamento). */
export interface AdditionalService {
  enabled: boolean;
  hours: number;
  hourlyRate: number;
}

export interface AdditionalServices {
  modeling: AdditionalService;
  scanning: AdditionalService;
  slicing: AdditionalService;
}

export interface BudgetInput {
  /** Integrante do laboratorio responsavel pela elaboracao deste orcamento. */
  attendedBy: string;
  requester: RequesterData;
  print: PrintData;
  services: AdditionalServices;
  notes?: string;
}

/** Detalhamento de custos calculados pela camada de servicos. */
export interface CostBreakdown {
  materialCost: number;
  /** Custo de operacao da maquina (energia + desgaste combinados). */
  machineCost: number;
  modelingCost: number;
  scanningCost: number;
  slicingCost: number;
  total: number;
}

export interface CalculationDetails {
  printTimeDecimalHours: number;
  materialUsed: MaterialConfig;
}

export interface Budget {
  id: string;
  budgetNumber: string;
  createdAt: string;
  input: BudgetInput;
  costs: CostBreakdown;
  details: CalculationDetails;
}

export interface CalculationParameters {
  /** Custo de operacao da maquina por hora de impressao (energia + desgaste combinados). */
  machineCostPerHour: number;
  /** Margem (%) aplicada em cima do custo de maquina por hora. */
  machineCostMarkupPercentage: number;
}

export interface LabInfo {
  name: string;
  document?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}
