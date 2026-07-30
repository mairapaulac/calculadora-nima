import { CalculationParameters, LabInfo } from "../types/budget.types";

/**
 * Parametros gerais de calculo do orcamento.
 * Ajuste estes valores conforme a realidade do laboratorio
 * (custo de energia local, potencia media das impressoras, etc).
 */
export const calculationParameters: CalculationParameters = {
  printerPowerWatts: 220,
  kwhPrice: 0.95,
  machineWearPerHour: 3.5,
};

/** Dados do laboratorio exibidos no cabecalho do orcamento gerado. */
export const labInfo: LabInfo = {
  name: "NIMA - Laboratorio de Manufatura Aditiva",
  document: "",
  address: "",
  contactEmail: "",
  contactPhone: "",
};
