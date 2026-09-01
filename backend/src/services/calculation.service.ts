import { getMaterialByKey } from "../config/materials.config";
import { calculationParameters } from "../config/pricing.config";
import {
  AdditionalService,
  BudgetInput,
  PrintItemCosts,
  PrintItemInput,
  ScanItemCosts,
  ScanItemInput,
} from "../types/budget.types";
import { round2 } from "../utils/currency.utils";
import { toDecimalHours } from "../utils/time.utils";

/** Custo de um servico complementar global (atualmente apenas modelagem 3D). */
function calculateServiceCost(service: AdditionalService): number {
  if (!service.enabled) return 0;
  return round2(service.hours * service.hourlyRate);
}

/**
 * Custo real de insumo consumido por um item de impressao (nunca digitado pelo operador):
 *
 *   (custo do material por grama x peso x quantidade)
 * + (tempo de impressao em horas x quantidade x custo real de maquina por hora)
 */
function calculateCustoInsumo(
  input: PrintItemInput,
  material: ReturnType<typeof getMaterialByKey>,
  printTimeDecimalHours: number
): number {
  const quantity = input.quantity || 0;
  const materialInsumo = input.weightInGrams * material.insumoCostPerGram * quantity;
  const machineInsumo =
    printTimeDecimalHours * quantity * calculationParameters.insumoMachineCostPerHour;
  return round2(materialInsumo + machineInsumo);
}

/** Calcula os custos de um item de impressao 3D: material + maquina + fatiamento + taxa EJ. */
export function calculatePrintItemCosts(input: PrintItemInput): {
  costs: PrintItemCosts;
  printTimeDecimalHours: number;
  materialUsed: ReturnType<typeof getMaterialByKey>;
} {
  const material = getMaterialByKey(input.materialKey);
  const printTimeDecimalHours = toDecimalHours(input.printTime);
  const quantity = input.quantity || 0;

  const custoInsumo = calculateCustoInsumo(input, material, printTimeDecimalHours);
  const materialCost = round2(custoInsumo * calculationParameters.custoInsumoMarkupMultiplier);

  const machineCost = round2(
    printTimeDecimalHours * quantity * calculationParameters.machineHourlyChargeRate
  );

  const slicingFee = input.slicing ? calculationParameters.slicingFlatFee : 0;

  const subtotalNima = round2(materialCost + machineCost + slicingFee);
  const taxaEJ = round2(subtotalNima * (calculationParameters.ejTaxPercentage / 100));
  const valorFinalCobrado = round2(subtotalNima + taxaEJ);
  const lucroLab = round2(subtotalNima - custoInsumo);

  return {
    costs: {
      materialCost,
      machineCost,
      slicingFee,
      subtotalNima,
      taxaEJ,
      valorFinalCobrado,
      custoInsumo,
      lucroLab,
    },
    printTimeDecimalHours: round2(printTimeDecimalHours),
    materialUsed: material,
  };
}

/** Calcula o custo de um item de escaneamento 3D: horas x valor-hora. */
export function calculateScanItemCosts(input: ScanItemInput): ScanItemCosts {
  return {
    valorFinalCobrado: round2(input.scanTimeHours * input.hourlyRate),
  };
}

/**
 * Camada centralizada de regras de negocio para calculo de orcamento.
 * Toda a logica financeira da aplicacao vive aqui, para que
 * controllers/rotas e o frontend (simulacao) permanecam consistentes.
 */
export function calculateBudgetTotals(input: BudgetInput): {
  printItemsCosts: PrintItemCosts[];
  scanItemsCosts: ScanItemCosts[];
  modelingCost: number;
  total: number;
} {
  const printItemsCosts = input.printItems.map((item) => calculatePrintItemCosts(item).costs);
  const scanItemsCosts = input.scanItems.map((item) => calculateScanItemCosts(item));

  const modelingCost = calculateServiceCost(input.services.modeling);

  const total = round2(
    printItemsCosts.reduce((sum, c) => sum + c.valorFinalCobrado, 0) +
      scanItemsCosts.reduce((sum, c) => sum + c.valorFinalCobrado, 0) +
      modelingCost
  );

  return { printItemsCosts, scanItemsCosts, modelingCost, total };
}
