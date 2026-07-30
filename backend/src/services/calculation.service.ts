import { getMaterialByKey } from "../config/materials.config";
import { calculationParameters } from "../config/pricing.config";
import {
  AdditionalService,
  BudgetInput,
  CalculationDetails,
  CostBreakdown,
} from "../types/budget.types";
import { round2 } from "../utils/currency.utils";
import { toDecimalHours } from "../utils/time.utils";

/** Custo de um servico complementar (modelagem, escaneamento ou fatiamento). */
function calculateServiceCost(service: AdditionalService): number {
  if (!service.enabled) return 0;
  return round2(service.hours * service.hourlyRate);
}

/**
 * Camada centralizada de regras de negocio para calculo de orcamento.
 * Toda a logica financeira da aplicacao vive aqui, para que
 * controllers/rotas e o frontend (simulacao) permanecam consistentes.
 */
export function calculateBudget(input: BudgetInput): {
  costs: CostBreakdown;
  details: CalculationDetails;
} {
  const material = getMaterialByKey(input.print.materialKey);
  const printTimeDecimalHours = toDecimalHours(input.print.printTime);

  // 1. Custo de material = peso (g) x valor por grama do filamento
  const materialCost = round2(input.print.weightInGrams * material.pricePerGram);

  // 2. Consumo de energia
  const energyConsumedKwh =
    (calculationParameters.printerPowerWatts / 1000) * printTimeDecimalHours;
  const energyCost = round2(energyConsumedKwh * calculationParameters.kwhPrice);

  // 3. Desgaste da maquina
  const machineWearCost = round2(
    printTimeDecimalHours * calculationParameters.machineWearPerHour
  );

  // Servicos adicionais
  const modelingCost = calculateServiceCost(input.services.modeling);
  const scanningCost = calculateServiceCost(input.services.scanning);
  const slicingCost = calculateServiceCost(input.services.slicing);

  const total = round2(
    materialCost +
      energyCost +
      machineWearCost +
      modelingCost +
      scanningCost +
      slicingCost
  );

  const costs: CostBreakdown = {
    materialCost,
    energyCost,
    machineWearCost,
    modelingCost,
    scanningCost,
    slicingCost,
    total,
  };

  const details: CalculationDetails = {
    printTimeDecimalHours: round2(printTimeDecimalHours),
    energyConsumedKwh: round2(energyConsumedKwh),
    materialUsed: material,
  };

  return { costs, details };
}
