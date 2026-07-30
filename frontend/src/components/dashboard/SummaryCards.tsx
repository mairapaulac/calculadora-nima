import { Budget } from "../../types/budget.types";
import { formatBRL } from "../../utils/currency";
import { Card } from "../common/Card";

interface SummaryCardsProps {
  budgets: Budget[];
}

export function SummaryCards({ budgets }: SummaryCardsProps) {
  const total = budgets.reduce((sum, budget) => sum + budget.costs.total, 0);
  const average = budgets.length > 0 ? total / budgets.length : 0;

  const items = [
    { label: "Orçamentos gerados", value: String(budgets.length) },
    { label: "Valor total orçado", value: formatBRL(total) },
    { label: "Ticket médio", value: formatBRL(average) },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
