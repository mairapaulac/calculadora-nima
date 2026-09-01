import { CalculationParameters, LabInfo } from "../types/budget.types";

/**
 * Parametros gerais de calculo do orcamento.
 * Ajuste estes valores conforme a realidade do laboratorio.
 * PLACEHOLDER: custoInsumoMarkupMultiplier, machineHourlyChargeRate e
 * insumoMachineCostPerHour foram migrados do modelo antigo (machineCostPerHour +
 * machineCostMarkupPercentage) - revisar com o laboratorio antes de gerar orcamentos reais.
 */
export const calculationParameters: CalculationParameters = {
  /** Multiplicador sobre o custo de insumo que compoe a parcela de material do subtotal NIMA. */
  custoInsumoMarkupMultiplier: 1.7,
  /** Valor-hora (R$) cobrado do solicitante pelo uso da maquina (horas x quantidade). */
  machineHourlyChargeRate: 4.26,
  /** Taxa fixa (R$) cobrada por item de impressao quando o fatiamento estiver habilitado. */
  slicingFlatFee: 5,
  /** Percentual da taxa EJ aplicada sobre o subtotal NIMA de cada item de impressao. */
  ejTaxPercentage: 20,
  /** Custo real (R$/h) de operacao da maquina (energia + desgaste), usado no custo de insumo. */
  insumoMachineCostPerHour: 3.7,
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
