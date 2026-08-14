import { createEmptyScanItem } from "../../config/defaultBudgetInput";
import {
  AppConfig,
  BudgetInput,
  ComplexityLevel,
  ScanItemInput,
  ScanStatus,
} from "../../types/budget.types";
import { FormErrors } from "../../utils/validation";
import { Card } from "../common/Card";
import { MoneyInput } from "../common/MoneyInput";
import { NumberInput } from "../common/NumberInput";
import { SelectInput } from "../common/SelectInput";
import { TextInput } from "../common/TextInput";

interface ScanItemsSectionProps {
  input: BudgetInput;
  config: AppConfig | null;
  errors: FormErrors;
  onChange: (updater: (draft: BudgetInput) => BudgetInput) => void;
}

export function ScanItemsSection({ input, config, errors, onChange }: ScanItemsSectionProps) {
  const statusOptions = (config?.options.scanStatusOptions || []).map((o) => ({
    value: o.value,
    label: o.label,
  }));
  const complexityOptions = (config?.options.complexityOptions || []).map((o) => ({
    value: o.value,
    label: o.label,
  }));
  const postProcessingOptions = (config?.options.postProcessingOptions || []).map((value) => ({
    value,
    label: value,
  }));

  function updateItem(index: number, patch: Partial<ScanItemInput>) {
    onChange((draft) => ({
      ...draft,
      scanItems: draft.scanItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function addItem() {
    onChange((draft) => ({ ...draft, scanItems: [...draft.scanItems, createEmptyScanItem(config)] }));
  }

  function removeItem(index: number) {
    onChange((draft) => ({
      ...draft,
      scanItems: draft.scanItems.filter((_, i) => i !== index),
    }));
  }

  return (
    <Card title="Itens de Escaneamento 3D" subtitle="Peças a serem escaneadas neste orçamento">
      <div className="flex flex-col gap-4">
        {input.scanItems.map((item, index) => {
          const itemErrors = errors.scanItems?.[index];
          return (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <TextInput
                    label={`Peça #${index + 1}`}
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NumberInput
                  label="Tempo de escaneamento"
                  value={item.scanTimeHours}
                  step={0.5}
                  suffix="h"
                  error={itemErrors?.scanTimeHours}
                  onChange={(value) => updateItem(index, { scanTimeHours: value })}
                />
                <MoneyInput
                  label="Valor por hora"
                  value={item.hourlyRate}
                  onChange={(value) => updateItem(index, { hourlyRate: value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SelectInput
                  label="Complexidade"
                  value={item.complexity}
                  options={complexityOptions}
                  onChange={(value) => updateItem(index, { complexity: value as ComplexityLevel })}
                />
                <SelectInput
                  label="Pós-Processamento/Malha"
                  value={item.postProcessing}
                  options={postProcessingOptions}
                  error={itemErrors?.postProcessing}
                  onChange={(value) => updateItem(index, { postProcessing: value })}
                />
                <SelectInput
                  label="Status"
                  value={item.status}
                  options={statusOptions}
                  onChange={(value) => updateItem(index, { status: value as ScanStatus })}
                />
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-dashed border-brand-400 px-4 py-2 text-sm font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/20"
        >
          + Adicionar peça de escaneamento
        </button>
      </div>
    </Card>
  );
}
