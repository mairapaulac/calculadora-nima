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

export type PrintStatus =
  | "PENDENTE"
  | "APROVADO"
  | "EM_PRODUCAO"
  | "CONCLUIDO"
  | "CANCELADO";

export type ScanStatus = PrintStatus;

export type ComplexityLevel = "BAIXA" | "MEDIA" | "ALTA";

export interface PrintItemInput {
  itemName: string;
  materialKey: FilamentKey;
  weightInGrams: number;
  printTime: PrintTime;
  quantity: number;
  slicing: boolean;
  custoInsumo: number;
  status: PrintStatus;
}

export interface PrintItemCosts {
  materialCost: number;
  machineCost: number;
  slicingFee: number;
  subtotalNima: number;
  taxaEJ: number;
  valorFinalCobrado: number;
  lucroLab: number;
}

export interface PrintItem {
  id: string;
  code: string;
  input: PrintItemInput;
  costs: PrintItemCosts;
  materialUsed: MaterialConfig;
  printTimeDecimalHours: number;
}

export interface ScanItemInput {
  itemName: string;
  scanTimeHours: number;
  hourlyRate: number;
  complexity: ComplexityLevel;
  postProcessing: string;
  status: ScanStatus;
}

export interface ScanItemCosts {
  valorFinalCobrado: number;
}

export interface ScanItem {
  id: string;
  code: string;
  input: ScanItemInput;
  costs: ScanItemCosts;
}

export interface AdditionalService {
  enabled: boolean;
  hours: number;
  hourlyRate: number;
}

export interface AdditionalServices {
  modeling: AdditionalService;
}

export interface BudgetInput {
  /** Integrante do laboratorio responsavel pela elaboracao deste orcamento. */
  attendedBy: string;
  requester: RequesterData;
  printItems: PrintItemInput[];
  scanItems: ScanItemInput[];
  services: AdditionalServices;
  notes?: string;
}

export interface Budget {
  id: string;
  budgetNumber: string;
  createdAt: string;
  input: BudgetInput;
  printItems: PrintItem[];
  scanItems: ScanItem[];
  modelingCost: number;
  total: number;
}

export interface CalculationParameters {
  machineCostPerHour: number;
  machineCostMarkupPercentage: number;
  slicingFlatFee: number;
  ejTaxPercentage: number;
  defaultScanningHourlyRate: number;
}

export interface LabInfo {
  name: string;
  document?: string;
  address?: string;
  contactEmail?: string;
  whatsapp1?: string;
  whatsapp2?: string;
}

export interface OptionsConfig {
  printStatusOptions: Array<{ value: PrintStatus; label: string }>;
  scanStatusOptions: Array<{ value: ScanStatus; label: string }>;
  complexityOptions: Array<{ value: ComplexityLevel; label: string }>;
  postProcessingOptions: string[];
}

export interface AppConfig {
  materials: MaterialConfig[];
  calculationParameters: CalculationParameters;
  labInfo: LabInfo;
  labMembers: string[];
  options: OptionsConfig;
}
