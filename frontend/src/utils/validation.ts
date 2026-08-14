import { BudgetInput } from "../types/budget.types";

export interface ItemErrors {
  itemName?: string;
  weightInGrams?: string;
  printTime?: string;
  scanTimeHours?: string;
  postProcessing?: string;
}

export type FormErrors = Partial<{
  attendedBy: string;
  name: string;
  email: string;
  projectDescription: string;
  items: string;
  modelingHours: string;
  printItems: ItemErrors[];
  scanItems: ItemErrors[];
}>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validacao client-side dos campos obrigatorios antes de enviar ao backend. */
export function validateBudgetInput(input: BudgetInput): FormErrors {
  const errors: FormErrors = {};

  if (!input.attendedBy.trim()) {
    errors.attendedBy = "Selecione quem elaborou o orçamento.";
  }

  if (!input.requester.name.trim()) {
    errors.name = "Informe o nome do solicitante.";
  }

  if (!EMAIL_REGEX.test(input.requester.email.trim())) {
    errors.email = "Informe um e-mail valido.";
  }

  if (!input.requester.projectDescription.trim()) {
    errors.projectDescription = "Descreva a peça/projeto.";
  }

  if (input.printItems.length + input.scanItems.length === 0) {
    errors.items = "Adicione ao menos um item de impressão ou escaneamento.";
  }

  const printItemErrors: ItemErrors[] = input.printItems.map((item) => {
    const itemError: ItemErrors = {};
    if (!item.itemName.trim()) itemError.itemName = "Informe o nome da peça/demanda.";
    if (!item.weightInGrams || item.weightInGrams <= 0) {
      itemError.weightInGrams = "Peso deve ser maior que zero.";
    }
    if (item.printTime.hours === 0 && item.printTime.minutes === 0) {
      itemError.printTime = "Informe o tempo de impressão.";
    }
    return itemError;
  });
  if (printItemErrors.some((e) => Object.keys(e).length > 0)) {
    errors.printItems = printItemErrors;
  }

  const scanItemErrors: ItemErrors[] = input.scanItems.map((item) => {
    const itemError: ItemErrors = {};
    if (!item.itemName.trim()) itemError.itemName = "Informe o nome da peça.";
    if (!item.scanTimeHours || item.scanTimeHours <= 0) {
      itemError.scanTimeHours = "Tempo de escaneamento deve ser maior que zero.";
    }
    if (!item.postProcessing.trim()) {
      itemError.postProcessing = "Informe o pós-processamento/malha.";
    }
    return itemError;
  });
  if (scanItemErrors.some((e) => Object.keys(e).length > 0)) {
    errors.scanItems = scanItemErrors;
  }

  if (input.services.modeling.enabled && input.services.modeling.hours <= 0) {
    errors.modelingHours = "Informe as horas de modelagem.";
  }

  return errors;
}
