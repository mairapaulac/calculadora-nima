import { BudgetInput } from "../types/budget.types";

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
    print: {
      materialKey: "PLA",
      weightInGrams: 0,
      printTime: { hours: 0, minutes: 0 },
    },
    services: {
      modeling: { enabled: false, hours: 0, hourlyRate: 0 },
      scanning: { enabled: false, hours: 0, hourlyRate: 0 },
      slicing: { enabled: false, hours: 0, hourlyRate: 0 },
    },
    notes: "",
  };
}
