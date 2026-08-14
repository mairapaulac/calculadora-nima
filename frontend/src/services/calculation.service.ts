import {
  AdditionalService,
  AppConfig,
  PrintItemCosts,
  PrintItemInput,
  ScanItemCosts,
  ScanItemInput,
} from "../types/budget.types";
import { round2 } from "../utils/currency";
import { toDecimalHours } from "../utils/time";

function calculateServiceCost(service: AdditionalService): number {
  if (!service.enabled) return 0;
  return round2(service.hours * service.hourlyRate);
}

/** Espelho client-side do calculo de um item de impressao (backend: calculation.service.ts). */
export function simulatePrintItemCosts(item: PrintItemInput, config: AppConfig): PrintItemCosts {
  const material = config.materials.find((m) => m.key === item.materialKey);
  const printTimeDecimalHours = toDecimalHours(item.printTime);

  const materialCost = material ? round2((item.weightInGrams || 0) * material.pricePerGram) : 0;

  const effectiveMachineCostPerHour =
    config.calculationParameters.machineCostPerHour *
    (1 + config.calculationParameters.machineCostMarkupPercentage / 100);
  const machineCost = round2(printTimeDecimalHours * effectiveMachineCostPerHour);

  const slicingFee = item.slicing ? config.calculationParameters.slicingFlatFee : 0;

  const subtotalNima = round2(materialCost + machineCost + slicingFee);
  const taxaEJ = round2(subtotalNima * (config.calculationParameters.ejTaxPercentage / 100));
  const valorFinalCobrado = round2(subtotalNima + taxaEJ);
  const lucroLab = round2(subtotalNima - (item.custoInsumo || 0));

  return { materialCost, machineCost, slicingFee, subtotalNima, taxaEJ, valorFinalCobrado, lucroLab };
}

/** Espelho client-side do calculo de um item de escaneamento. */
export function simulateScanItemCosts(item: ScanItemInput): ScanItemCosts {
  return { valorFinalCobrado: round2((item.scanTimeHours || 0) * (item.hourlyRate || 0)) };
}

export interface SimulatedTotals {
  printItemsCosts: PrintItemCosts[];
  scanItemsCosts: ScanItemCosts[];
  modelingCost: number;
  total: number;
}

/**
 * Simulacao instantanea usada enquanto o operador preenche o formulario.
 * O calculo oficial, persistido e usado nos documentos gerados e sempre o do backend.
 */
export function simulateBudget(
  printItems: PrintItemInput[],
  scanItems: ScanItemInput[],
  modeling: AdditionalService,
  config: AppConfig
): SimulatedTotals {
  const printItemsCosts = printItems.map((item) => simulatePrintItemCosts(item, config));
  const scanItemsCosts = scanItems.map((item) => simulateScanItemCosts(item));
  const modelingCost = calculateServiceCost(modeling);

  const total = round2(
    printItemsCosts.reduce((sum, c) => sum + c.valorFinalCobrado, 0) +
      scanItemsCosts.reduce((sum, c) => sum + c.valorFinalCobrado, 0) +
      modelingCost
  );

  return { printItemsCosts, scanItemsCosts, modelingCost, total };
}
