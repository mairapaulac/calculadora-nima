import { CalculationParameters, LabInfo } from "../types/budget.types";

/**
 * Parametros gerais de calculo do orcamento.
 * Ajuste estes valores conforme a realidade do laboratorio.
 */
export const calculationParameters: CalculationParameters = {
  /** Custo de operacao da maquina por hora de impressao (ja engloba energia + desgaste). */
  machineCostPerHour: 3.7,
  /** Margem aplicada em cima do custo de maquina por hora. */
  machineCostMarkupPercentage: 15,
};

/** Dados do laboratorio exibidos no cabecalho do orcamento gerado. */
export const labInfo: LabInfo = {
  name: "NIMA - Laboratorio de Manufatura Aditiva",
  document: "",
  address: "",
  contactEmail: "",
  contactPhone: "",
};
