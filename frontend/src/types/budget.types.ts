/**
 * Tipos de dominio - espelho de backend/src/types/budget.types.ts.
 * Mantidos sincronizados manualmente nesta primeira versao sem pacote
 * compartilhado (ver README - evolucoes futuras / monorepo).
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

export interface CostBreakdown {
  materialCost: number;
  energyCost: number;
  machineWearCost: number;
  modelingCost: number;
  scanningCost: number;
  slicingCost: number;
  total: number;
}

export interface CalculationDetails {
  printTimeDecimalHours: number;
  energyConsumedKwh: number;
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
  printerPowerWatts: number;
  kwhPrice: number;
  machineWearPerHour: number;
}

export interface LabInfo {
  name: string;
  document?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface AppConfig {
  materials: MaterialConfig[];
  calculationParameters: CalculationParameters;
  labInfo: LabInfo;
  labMembers: string[];
}
