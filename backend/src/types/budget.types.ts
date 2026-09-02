/**
 * Tipos de dominio da aplicacao de orcamento de manufatura aditiva.
 * Mantidos em espelho no frontend (src/types/budget.types.ts) ate que
 * o projeto passe a usar um pacote compartilhado (ver README - evolucoes futuras).
 */

export type FilamentKey =
  | "PLA"
  | "PETG"
  | "ABS"
  | "ASA"
  | "TPU"
  | "NYLON"
  | "RESINA"
  /** Material trazido pelo proprio solicitante - sem custo de insumo. */
  | "PROPRIO"
  | "OUTROS";

export interface MaterialConfig {
  key: FilamentKey;
  name: string;
  pricePerKg: number;
  pricePerGram: number;
  /** Custo real (R$/g) pago pelo laboratorio na compra do material - base do custo de insumo. */
  insumoCostPerGram: number;
}

/** Tempo de impressao/escaneamento informado pelo operador, em horas e minutos. */
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

/** Dados informados pelo operador para um item de impressao 3D dentro do orcamento. */
export interface PrintItemInput {
  itemName: string;
  materialKey: FilamentKey;
  weightInGrams: number;
  printTime: PrintTime;
  quantity: number;
  /** Fatiamento (Sim/Nao) - quando true, cobra a taxa fixa de fatiamento. */
  slicing: boolean;
  status: PrintStatus;
}

/** Detalhamento de custos calculados para um item de impressao. */
export interface PrintItemCosts {
  materialCost: number;
  machineCost: number;
  slicingFee: number;
  subtotalNima: number;
  taxaEJ: number;
  valorFinalCobrado: number;
  /** Custo real do insumo consumido - derivado do material, peso, tempo e quantidade. */
  custoInsumo: number;
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

/** Dados informados pelo operador para um item de escaneamento 3D dentro do orcamento. */
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

/** Um servico complementar global do orcamento (atualmente apenas modelagem 3D). */
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
  /** Multiplicador sobre o custo de insumo que compoe a parcela de material do subtotal NIMA. */
  custoInsumoMarkupMultiplier: number;
  /** Valor-hora (R$) cobrado do solicitante pelo uso da maquina (horas x quantidade). */
  machineHourlyChargeRate: number;
  /** Taxa fixa de fatiamento (R$) cobrada por item de impressao quando habilitada. */
  slicingFlatFee: number;
  /** Percentual da taxa EJ aplicada sobre o subtotal NIMA de cada item de impressao. */
  ejTaxPercentage: number;
  /** Custo real (R$/h) de operacao da maquina, usado no calculo do custo de insumo. */
  insumoMachineCostPerHour: number;
  /** Valor-hora padrao sugerido para servicos de escaneamento 3D. */
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
