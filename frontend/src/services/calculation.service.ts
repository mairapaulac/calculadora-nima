import {
  AdditionalService,
  AppConfig,
  BudgetInput,
  CostBreakdown,
} from "../types/budget.types";
import { round2 } from "../utils/currency";
import { toDecimalHours } from "../utils/time";

function calculateServiceCost(service: AdditionalService): number {
  if (!service.enabled) return 0;
  return round2(service.hours * service.hourlyRate);
}

/**
 * Espelho client-side da regra de negocio do backend (calculation.service.ts),
 * usado apenas para a simulacao instantanea enquanto o operador preenche o
 * formulario. O calculo oficial, persistido e usado nos documentos gerados
 * e sempre o do backend.
 */
export function simulateBudget(input: BudgetInput, config: AppConfig): CostBreakdown {
  const material = config.materials.find((m) => m.key === input.print.materialKey);
  const printTimeDecimalHours = toDecimalHours(input.print.printTime);

  const materialCost = material
    ? round2((input.print.weightInGrams || 0) * material.pricePerGram)
    : 0;

  const energyConsumedKwh =
    (config.calculationParameters.printerPowerWatts / 1000) * printTimeDecimalHours;
  const energyCost = round2(energyConsumedKwh * config.calculationParameters.kwhPrice);

  const machineWearCost = round2(
    printTimeDecimalHours * config.calculationParameters.machineWearPerHour
  );

  const modelingCost = calculateServiceCost(input.services.modeling);
  const scanningCost = calculateServiceCost(input.services.scanning);
  const slicingCost = calculateServiceCost(input.services.slicing);

  const total = round2(
    materialCost + energyCost + machineWearCost + modelingCost + scanningCost + slicingCost
  );

  return {
    materialCost,
    energyCost,
    machineWearCost,
    modelingCost,
    scanningCost,
    slicingCost,
    total,
  };
}
