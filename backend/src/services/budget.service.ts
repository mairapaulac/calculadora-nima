import { v4 as uuid } from "uuid";
import { budgetRepository } from "../repositories/budget.repository";
import { Budget, BudgetInput } from "../types/budget.types";
import { generateBudgetNumber } from "../utils/id.utils";
import { calculateBudget } from "./calculation.service";

/** Cria um orcamento completo a partir dos dados informados pelo operador, persiste e retorna. */
export function createBudget(input: BudgetInput): Budget {
  const { costs, details } = calculateBudget(input);

  const budget: Budget = {
    id: uuid(),
    budgetNumber: generateBudgetNumber(),
    createdAt: new Date().toISOString(),
    input,
    costs,
    details,
  };

  return budgetRepository.save(budget);
}

export function getBudgetById(id: string): Budget | undefined {
  return budgetRepository.findById(id);
}

export function listBudgets(): Budget[] {
  return budgetRepository.list();
}
