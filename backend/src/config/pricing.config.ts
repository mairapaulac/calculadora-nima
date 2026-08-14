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
  /** Taxa fixa (R$) cobrada por item de impressao quando o fatiamento estiver habilitado. */
  slicingFlatFee: 5,
  /** Percentual da taxa EJ aplicada sobre o subtotal NIMA de cada item de impressao. */
  ejTaxPercentage: 20,
  /** Valor-hora padrao sugerido ao cadastrar um novo item de escaneamento 3D. */
  defaultScanningHourlyRate: 120,
};

/** Dados do laboratorio exibidos no cabecalho/rodape do orcamento gerado. */
export const labInfo: LabInfo = {
  name: "NIMA - Núcleo Interdisciplinar de Manufatura Aditiva",
  document: "",
  address: "",
  contactEmail: "nima@univasf.edu.br",
  whatsapp1: "(12) 3456-7890",
  whatsapp2: "(87) 98838-1364",
};
