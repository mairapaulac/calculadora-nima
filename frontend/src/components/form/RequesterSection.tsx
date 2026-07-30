import { BudgetInput } from "../../types/budget.types";
import { FormErrors } from "../../utils/validation";
import { Card } from "../common/Card";
import { TextAreaInput } from "../common/TextAreaInput";
import { TextInput } from "../common/TextInput";

interface RequesterSectionProps {
  input: BudgetInput;
  errors: FormErrors;
  onChange: (updater: (draft: BudgetInput) => BudgetInput) => void;
}

export function RequesterSection({ input, errors, onChange }: RequesterSectionProps) {
  return (
    <Card title="Dados da Solicitação" subtitle="Quem está solicitando a impressão">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput
          label="Nome do solicitante"
          value={input.requester.name}
          error={errors.name}
          onChange={(e) =>
            onChange((draft) => ({
              ...draft,
              requester: { ...draft.requester, name: e.target.value },
            }))
          }
        />
        <TextInput
          label="E-mail do solicitante"
          type="email"
          value={input.requester.email}
          error={errors.email}
          onChange={(e) =>
            onChange((draft) => ({
              ...draft,
              requester: { ...draft.requester, email: e.target.value },
            }))
          }
        />
        <TextInput
          label="Departamento/Setor (opcional)"
          value={input.requester.department || ""}
          onChange={(e) =>
            onChange((draft) => ({
              ...draft,
              requester: { ...draft.requester, department: e.target.value },
            }))
          }
        />
        <div className="sm:col-span-2">
          <TextAreaInput
            label="Descrição da peça/projeto"
            value={input.requester.projectDescription}
            error={errors.projectDescription}
            onChange={(e) =>
              onChange((draft) => ({
                ...draft,
                requester: { ...draft.requester, projectDescription: e.target.value },
              }))
            }
          />
        </div>
      </div>
    </Card>
  );
}
