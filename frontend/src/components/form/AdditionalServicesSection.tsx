import { BudgetInput } from "../../types/budget.types";
import { FormErrors } from "../../utils/validation";
import { Card } from "../common/Card";
import { Checkbox } from "../common/Checkbox";
import { MoneyInput } from "../common/MoneyInput";
import { NumberInput } from "../common/NumberInput";

interface AdditionalServicesSectionProps {
  input: BudgetInput;
  errors: FormErrors;
  onChange: (updater: (draft: BudgetInput) => BudgetInput) => void;
}

export function AdditionalServicesSection({
  input,
  errors,
  onChange,
}: AdditionalServicesSectionProps) {
  const modeling = input.services.modeling;

  function updateModeling(patch: Partial<typeof modeling>) {
    onChange((draft) => ({
      ...draft,
      services: { ...draft.services, modeling: { ...draft.services.modeling, ...patch } },
    }));
  }

  return (
    <Card title="Serviços Adicionais" subtitle="Serviços complementares ao orçamento">
      <div className="flex max-w-xs flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <Checkbox
          label="Modelagem 3D"
          checked={modeling.enabled}
          onChange={(checked) => updateModeling({ enabled: checked })}
        />
        {modeling.enabled && (
          <div className="flex flex-col gap-3">
            <NumberInput
              label="Horas trabalhadas"
              value={modeling.hours}
              step={0.5}
              error={errors.modelingHours}
              onChange={(value) => updateModeling({ hours: value })}
            />
            <MoneyInput
              label="Valor por hora"
              value={modeling.hourlyRate}
              onChange={(value) => updateModeling({ hourlyRate: value })}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
