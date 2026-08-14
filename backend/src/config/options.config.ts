import { OptionsConfig } from "../types/budget.types";

/**
 * Listas de opcoes usadas nos formularios de item de impressao/escaneamento.
 * Edite este arquivo para adicionar, remover ou renomear opcoes sem tocar
 * na logica de calculo ou validacao.
 */
const statusOptions: OptionsConfig["printStatusOptions"] = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "EM_PRODUCAO", label: "Em Produção" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Cancelado" },
];

export const optionsConfig: OptionsConfig = {
  printStatusOptions: statusOptions,
  scanStatusOptions: statusOptions,
  complexityOptions: [
    { value: "BAIXA", label: "🟢 Baixa" },
    { value: "MEDIA", label: "🟡 Média" },
    { value: "ALTA", label: "🔴 Alta" },
  ],
  postProcessingOptions: [
    "Apenas Limpeza",
    "Limpeza + Suavização",
    "Malha Otimizada (Retopologia)",
    "Reparo de Furos/Ruídos",
    "Outro",
  ],
};
