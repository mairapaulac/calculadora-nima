import { v4 as uuid } from "uuid";
import { budgetRepository } from "../repositories/budget.repository";
import {
  Budget,
  BudgetInput,
  PrintItem,
  PrintItemInput,
  ScanItem,
  ScanItemInput,
} from "../types/budget.types";
import {
  generateBudgetNumber,
  generatePrintItemCode,
  generateScanItemCode,
} from "../utils/id.utils";
import { calculatePrintItemCosts, calculateScanItemCosts } from "./calculation.service";

async function buildPrintItem(input: PrintItemInput): Promise<PrintItem> {
  const { costs, printTimeDecimalHours, materialUsed } = calculatePrintItemCosts(input);
  return {
    id: uuid(),
    code: await generatePrintItemCode(),
    input,
    costs,
    materialUsed,
    printTimeDecimalHours,
  };
}

async function buildScanItem(input: ScanItemInput): Promise<ScanItem> {
  return {
    id: uuid(),
    code: await generateScanItemCode(),
    input,
    costs: calculateScanItemCosts(input),
  };
}

/** Cria um orcamento completo a partir dos dados informados pelo operador, persiste e retorna. */
export async function createBudget(input: BudgetInput): Promise<Budget> {
  const printItems = await Promise.all(input.printItems.map(buildPrintItem));
  const scanItems = await Promise.all(input.scanItems.map(buildScanItem));

  const modelingCost = input.services.modeling.enabled
    ? Math.round(input.services.modeling.hours * input.services.modeling.hourlyRate * 100) / 100
    : 0;

  const total =
    Math.round(
      (printItems.reduce((sum, item) => sum + item.costs.valorFinalCobrado, 0) +
        scanItems.reduce((sum, item) => sum + item.costs.valorFinalCobrado, 0) +
        modelingCost) *
        100
    ) / 100;

  const budget: Budget = {
    id: uuid(),
    budgetNumber: await generateBudgetNumber(),
    createdAt: new Date().toISOString(),
    input,
    printItems,
    scanItems,
    modelingCost,
    total,
  };

  return budgetRepository.save(budget);
}

export function getBudgetById(id: string): Promise<Budget | undefined> {
  return budgetRepository.findById(id);
}

export function listBudgets(): Promise<Budget[]> {
  return budgetRepository.list();
}
