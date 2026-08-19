import { createEmptyPrintItem } from "../../config/defaultBudgetInput";
import { AppConfig, BudgetInput, FilamentKey, PrintItemInput } from "../../types/budget.types";
import { FormErrors } from "../../utils/validation";
import { simulateCustoInsumo } from "../../services/calculation.service";
import { formatBRL } from "../../utils/currency";
import { Card } from "../common/Card";
import { Checkbox } from "../common/Checkbox";
import { NumberInput } from "../common/NumberInput";
import { ReadOnlyField } from "../common/ReadOnlyField";
import { SelectInput } from "../common/SelectInput";
import { TextInput } from "../common/TextInput";

interface PrintItemsSectionProps {
  input: BudgetInput;
  config: AppConfig | null;
  errors: FormErrors;
  onChange: (updater: (draft: BudgetInput) => BudgetInput) => void;
}

export function PrintItemsSection({ input, config, errors, onChange }: PrintItemsSectionProps) {
  const materialOptions = (config?.materials || []).map((material) => ({
    value: material.key,
    label: `${material.name} — R$ ${material.pricePerKg.toFixed(2)}/kg`,
  }));
  const slicingFee = config?.calculationParameters.slicingFlatFee ?? 5;

  function updateItem(index: number, patch: Partial<PrintItemInput>) {
    onChange((draft) => ({
      ...draft,
      printItems: draft.printItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function addItem() {
    onChange((draft) => ({ ...draft, printItems: [...draft.printItems, createEmptyPrintItem()] }));
  }

  function removeItem(index: number) {
    onChange((draft) => ({
      ...draft,
      printItems: draft.printItems.filter((_, i) => i !== index),
    }));
  }

  return (
    <Card title="Itens de Impressão 3D" subtitle="Peças a serem impressas neste orçamento">
      <div className="flex flex-col gap-4">
        {input.printItems.map((item, index) => {
          const itemErrors = errors.printItems?.[index];
          const custoInsumo = config ? simulateCustoInsumo(item, config) : 0;
          return (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <TextInput
                    label={`Peça/Demanda #${index + 1}`}
                    value={item.itemName}
                    error={itemErrors?.itemName}
                    onChange={(e) => updateItem(index, { itemName: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="mt-6 shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
                >
                  Remover
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SelectInput
                  label="Tipo de filamento"
                  value={item.materialKey}
                  options={materialOptions}
                  onChange={(value) => updateItem(index, { materialKey: value as FilamentKey })}
                />
                <NumberInput
                  label="Peso da peça"
                  value={item.weightInGrams}
                  step="any"
                  suffix="g"
                  error={itemErrors?.weightInGrams}
                  onChange={(value) => updateItem(index, { weightInGrams: value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput
                    label="Horas"
                    value={item.printTime.hours}
                    error={itemErrors?.printTime}
                    onChange={(value) => updateItem(index, { printTime: { ...item.printTime, hours: value } })}
                  />
                  <NumberInput
                    label="Minutos"
                    value={item.printTime.minutes}
                    max={59}
                    onChange={(value) =>
                      updateItem(index, { printTime: { ...item.printTime, minutes: Math.min(value, 59) } })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NumberInput
                  label="Qtd. de peças/mesas"
                  value={item.quantity}
                  min={1}
                  onChange={(value) => updateItem(index, { quantity: value })}
                />
                <ReadOnlyField
                  label="Custo de insumo (real)"
                  value={formatBRL(custoInsumo)}
                  hint="Calculado a partir do material, peso, tempo e quantidade."
                />
              </div>

              <Checkbox
                label={`Fatiamento (+ R$ ${slicingFee.toFixed(2)})`}
                checked={item.slicing}
                onChange={(checked) => updateItem(index, { slicing: checked })}
              />
            </div>
          );
        })}

        {errors.items && input.printItems.length === 0 && input.scanItems.length === 0 && (
          <p className="text-xs text-red-500">{errors.items}</p>
        )}

        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-dashed border-brand-400 px-4 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/20"
        >
          + Adicionar peça de impressão
        </button>
      </div>
    </Card>
  );
}
