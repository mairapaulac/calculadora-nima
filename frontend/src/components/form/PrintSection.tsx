import { AppConfig, BudgetInput, FilamentKey } from "../../types/budget.types";
import { FormErrors } from "../../utils/validation";
import { Card } from "../common/Card";
import { NumberInput } from "../common/NumberInput";
import { SelectInput } from "../common/SelectInput";

interface PrintSectionProps {
  input: BudgetInput;
  config: AppConfig | null;
  errors: FormErrors;
  onChange: (updater: (draft: BudgetInput) => BudgetInput) => void;
}

export function PrintSection({ input, config, errors, onChange }: PrintSectionProps) {
  const materialOptions = (config?.materials || []).map((material) => ({
    value: material.key,
    label: `${material.name} — R$ ${material.pricePerKg.toFixed(2)}/kg`,
  }));

  return (
    <Card title="Dados da Impressão" subtitle="Material, peso e tempo de impressão">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SelectInput
          label="Tipo de filamento"
          value={input.print.materialKey}
          options={materialOptions}
          onChange={(value) =>
            onChange((draft) => ({
              ...draft,
              print: { ...draft.print, materialKey: value as FilamentKey },
            }))
          }
        />
        <NumberInput
          label="Peso da peça"
          value={input.print.weightInGrams}
          suffix="g"
          error={errors.weightInGrams}
          onChange={(value) =>
            onChange((draft) => ({
              ...draft,
              print: { ...draft.print, weightInGrams: value },
            }))
          }
        />
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="Horas"
            value={input.print.printTime.hours}
            error={errors.printTime}
            onChange={(value) =>
              onChange((draft) => ({
                ...draft,
                print: {
                  ...draft.print,
                  printTime: { ...draft.print.printTime, hours: value },
                },
              }))
            }
          />
          <NumberInput
            label="Minutos"
            value={input.print.printTime.minutes}
            max={59}
            onChange={(value) =>
              onChange((draft) => ({
                ...draft,
                print: {
                  ...draft.print,
                  printTime: { ...draft.print.printTime, minutes: Math.min(value, 59) },
                },
              }))
            }
          />
        </div>
      </div>
    </Card>
  );
}
