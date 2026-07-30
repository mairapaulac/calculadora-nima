import { CostBreakdown } from "../../types/budget.types";
import { formatBRL } from "../../utils/currency";
import { Card } from "../common/Card";

interface CostSummarySectionProps {
  costs: CostBreakdown;
}

const ROWS: Array<{ key: keyof Omit<CostBreakdown, "total">; label: string }> = [
  { key: "materialCost", label: "Material" },
  { key: "machineCost", label: "Custo de Máquina" },
  { key: "modelingCost", label: "Modelagem" },
  { key: "scanningCost", label: "Escaneamento" },
  { key: "slicingCost", label: "Fatiamento" },
];

export function CostSummarySection({ costs }: CostSummarySectionProps) {
  return (
    <Card title="Resumo Financeiro" subtitle="Atualizado em tempo real">
      <dl className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between py-2 text-sm">
            <dt className="text-slate-500 dark:text-slate-400">{row.label}</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-100">
              {formatBRL(costs[row.key])}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3 dark:bg-brand-900/30">
        <span className="text-sm font-semibold text-brand-800 dark:text-brand-200">
          Valor Total do Orçamento
        </span>
        <span className="text-lg font-bold text-brand-700 dark:text-brand-100">
          {formatBRL(costs.total)}
        </span>
      </div>
    </Card>
  );
}
