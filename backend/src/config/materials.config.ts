import { FilamentKey, MaterialConfig } from "../types/budget.types";

/**
 * Tabela de materiais/filamentos disponiveis e seus precos.
 * Edite este arquivo para atualizar valores ou adicionar novos materiais
 * sem tocar na logica de calculo.
 *
 * pricePerGram e derivado de pricePerKg, mas pode ser sobrescrito
 * manualmente caso o laboratorio negocie precos diferentes por grama.
 */
const rawMaterials: Array<{ key: FilamentKey; name: string; pricePerKg: number }> = [
  { key: "PLA", name: "PLA", pricePerKg: 120 },
  { key: "PETG", name: "PETG", pricePerKg: 140 },
  { key: "ABS", name: "ABS", pricePerKg: 130 },
  { key: "TPU", name: "TPU", pricePerKg: 180 },
  { key: "NYLON", name: "Nylon", pricePerKg: 250 },
  { key: "RESINA", name: "Resina", pricePerKg: 300 },
  { key: "OUTROS", name: "Outros", pricePerKg: 150 },
];

export const materialsConfig: Record<FilamentKey, MaterialConfig> = rawMaterials.reduce(
  (acc, material) => {
    acc[material.key] = {
      ...material,
      pricePerGram: material.pricePerKg / 1000,
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
