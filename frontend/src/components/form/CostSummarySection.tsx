import { SimulatedTotals } from "../../services/calculation.service";
import { BudgetInput } from "../../types/budget.types";
import { formatBRL } from "../../utils/currency";
import { Card } from "../common/Card";

interface CostSummarySectionProps {
  input: BudgetInput;
  totals: SimulatedTotals;
}

export function CostSummarySection({ input, totals }: CostSummarySectionProps) {
  const printRows = input.printItems.map((item, index) => ({
    label: item.itemName || `Peça de impressão #${index + 1}`,
    value: totals.printItemsCosts[index]?.valorFinalCobrado ?? 0,
  }));
  const scanRows = input.scanItems.map((item, index) => ({
    label: item.itemName || `Peça de escaneamento #${index + 1}`,
    value: totals.scanItemsCosts[index]?.valorFinalCobrado ?? 0,
  }));
  const rows = [
    ...printRows,
    ...scanRows,
    ...(input.services.modeling.enabled
      ? [{ label: "Modelagem 3D", value: totals.modelingCost }]
      : []),
  ];

  return (
    <Card title="Resumo Financeiro" subtitle="Atualizado em tempo real">
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Adicione itens de impressão ou escaneamento para ver o resumo.
        </p>
      ) : (
        <dl className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row, index) => (
            <div key={index} className="flex items-center justify-between gap-3 py-2 text-sm">
              <dt className="truncate text-slate-500 dark:text-slate-400">{row.label}</dt>
              <dd className="shrink-0 font-medium text-slate-800 dark:text-slate-100">
                {formatBRL(row.value)}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3 dark:bg-brand-900/30">
        <span className="text-sm font-semibold text-brand-800 dark:text-brand-200">
          Valor Total do Orçamento
        </span>
        <span className="text-lg font-bold text-brand-700 dark:text-brand-100">
          {formatBRL(totals.total)}
        </span>
      </div>
    </Card>
  );
}
