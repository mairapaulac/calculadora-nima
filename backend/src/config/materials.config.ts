import { FilamentKey, MaterialConfig } from "../types/budget.types";

/**
 * Tabela de materiais/filamentos disponiveis e seu custo por quilo.
 * Edite este arquivo para atualizar valores ou adicionar novos materiais
 * sem tocar na logica de calculo.
 *
 * pricePerKg e o custo REAL pago pelo laboratorio na compra do material.
 * Dele saem pricePerGram (exibido na lista de materiais do formulario) e
 * insumoCostPerGram (base do custo de insumo - ver calculation.service.ts).
 *
 * "Filamento proprio" cobre o caso em que o solicitante traz o material:
 * custo zero, entao o orcamento cobra apenas maquina/fatiamento.
 */
const rawMaterials: Array<{ key: FilamentKey; name: string; pricePerKg: number }> = [
  { key: "PLA", name: "PLA", pricePerKg: 115 },
  { key: "PETG", name: "PETG", pricePerKg: 120 },
  { key: "ABS", name: "ABS", pricePerKg: 85 },
  { key: "ASA", name: "ASA", pricePerKg: 115 },
  { key: "TPU", name: "TPU", pricePerKg: 111 },
  { key: "NYLON", name: "Nylon", pricePerKg: 165 },
  { key: "RESINA", name: "Resina ABS-Like", pricePerKg: 210 },
  { key: "PROPRIO", name: "Filamento próprio", pricePerKg: 0 },
  /** Fallback generico - ajustar quando o laboratorio definir um valor de referencia. */
  { key: "OUTROS", name: "Outros", pricePerKg: 150 },
];

export const materialsConfig: Record<FilamentKey, MaterialConfig> = rawMaterials.reduce(
  (acc, material) => {
    acc[material.key] = {
      key: material.key,
      name: material.name,
      pricePerKg: material.pricePerKg,
      pricePerGram: material.pricePerKg / 1000,
      insumoCostPerGram: material.pricePerKg / 1000,
    };
    return acc;
  },
  {} as Record<FilamentKey, MaterialConfig>
);

export const materialsList: MaterialConfig[] = Object.values(materialsConfig);

export function getMaterialByKey(key: FilamentKey): MaterialConfig {
  const material = materialsConfig[key];
  if (!material) {
    throw new Error(`Material desconhecido: ${key}`);
  }
  return material;
}
