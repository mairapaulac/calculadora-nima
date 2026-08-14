import { AppConfig, BudgetInput, PrintItemInput, ScanItemInput } from "../types/budget.types";

/** Estado inicial vazio do formulario de orcamento. */
export function createEmptyBudgetInput(): BudgetInput {
  return {
    attendedBy: "",
    requester: {
      name: "",
      email: "",
      department: "",
      projectDescription: "",
    },
    printItems: [],
    scanItems: [],
    services: {
      modeling: { enabled: false, hours: 0, hourlyRate: 0 },
    },
    notes: "",
  };
}

/** Estado inicial de um novo item de impressao adicionado ao orcamento. */
export function createEmptyPrintItem(): PrintItemInput {
  return {
    itemName: "",
    materialKey: "PLA",
    weightInGrams: 0,
    printTime: { hours: 0, minutes: 0 },
    quantity: 1,
    slicing: false,
    custoInsumo: 0,
    status: "PENDENTE",
  };
}

/** Estado inicial de um novo item de escaneamento adicionado ao orcamento. */
export function createEmptyScanItem(config: AppConfig | null): ScanItemInput {
  return {
    itemName: "",
    scanTimeHours: 0,
    hourlyRate: config?.calculationParameters.defaultScanningHourlyRate || 0,
    complexity: "MEDIA",
    postProcessing: config?.options.postProcessingOptions[0] || "",
    status: "PENDENTE",
  };
}
