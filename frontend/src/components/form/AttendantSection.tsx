import { AppConfig, BudgetInput } from "../../types/budget.types";
import { FormErrors } from "../../utils/validation";
import { Card } from "../common/Card";
import { SelectInput } from "../common/SelectInput";

interface AttendantSectionProps {
  input: BudgetInput;
  config: AppConfig | null;
  errors: FormErrors;
  onChange: (updater: (draft: BudgetInput) => BudgetInput) => void;
}

/** Identifica qual integrante do laboratorio elaborou este orcamento. */
export function AttendantSection({ input, config, errors, onChange }: AttendantSectionProps) {
  const memberOptions = [
    { value: "", label: "Selecione..." },
    ...(config?.labMembers || []).map((member) => ({ value: member, label: member })),
  ];

  return (
    <Card title="Responsável pelo Atendimento" subtitle="Quem do laboratório está elaborando este orçamento">
      <div className="max-w-xs">
        <SelectInput
          label="Elaborado por"
          value={input.attendedBy}
          options={memberOptions}
          error={errors.attendedBy}
          onChange={(value) => onChange((draft) => ({ ...draft, attendedBy: value }))}
        />
      </div>
    </Card>
  );
}
