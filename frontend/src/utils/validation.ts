import { BudgetInput } from "../types/budget.types";

export type FormErrors = Partial<{
  attendedBy: string;
  name: string;
  email: string;
  projectDescription: string;
  weightInGrams: string;
  printTime: string;
  modelingHours: string;
  scanningHours: string;
  slicingHours: string;
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
    errors.projectDescription = "Descreva a peca/projeto.";
  }

  if (!input.print.weightInGrams || input.print.weightInGrams <= 0) {
    errors.weightInGrams = "Peso deve ser maior que zero.";
  }

  if (input.print.printTime.hours === 0 && input.print.printTime.minutes === 0) {
    errors.printTime = "Informe o tempo de impressao.";
  }

  if (input.services.modeling.enabled && input.services.modeling.hours <= 0) {
    errors.modelingHours = "Informe as horas de modelagem.";
  }

  if (input.services.scanning.enabled && input.services.scanning.hours <= 0) {
    errors.scanningHours = "Informe as horas de escaneamento.";
  }

  if (input.services.slicing.enabled && input.services.slicing.hours <= 0) {
    errors.slicingHours = "Informe as horas de fatiamento.";
  }

  return errors;
}
