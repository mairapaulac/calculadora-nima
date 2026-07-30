import { AdditionalService, BudgetInput } from "../../types/budget.types";
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

type ServiceKey = keyof BudgetInput["services"];

const SERVICE_META: Record<ServiceKey, { title: string; errorKey: keyof FormErrors }> = {
  modeling: { title: "Modelagem 3D", errorKey: "modelingHours" },
  scanning: { title: "Escaneamento 3D", errorKey: "scanningHours" },
  slicing: { title: "Fatiamento", errorKey: "slicingHours" },
};

export function AdditionalServicesSection({
  input,
  errors,
  onChange,
}: AdditionalServicesSectionProps) {
  function updateService(key: ServiceKey, patch: Partial<AdditionalService>) {
    onChange((draft) => ({
      ...draft,
      services: {
        ...draft.services,
        [key]: { ...draft.services[key], ...patch },
      },
    }));
  }

  return (
    <Card title="Serviços Adicionais" subtitle="Serviços complementares à impressão">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {(Object.keys(SERVICE_META) as ServiceKey[]).map((key) => {
          const service = input.services[key];
          const meta = SERVICE_META[key];
          return (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700"
            >
              <Checkbox
                label={meta.title}
                checked={service.enabled}
                onChange={(checked) => updateService(key, { enabled: checked })}
              />
              {service.enabled && (
                <div className="flex flex-col gap-3">
                  <NumberInput
                    label="Horas trabalhadas"
                    value={service.hours}
                    step={0.5}
                    error={errors[meta.errorKey]}
                    onChange={(value) => updateService(key, { hours: value })}
                  />
                  <MoneyInput
                    label="Valor por hora"
                    value={service.hourlyRate}
                    onChange={(value) => updateService(key, { hourlyRate: value })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
