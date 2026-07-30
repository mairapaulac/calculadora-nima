import { Budget } from "../../types/budget.types";
import { formatBRL } from "../../utils/currency";
import { Card } from "../common/Card";

interface SummaryCardsProps {
  budgets: Budget[];
}

export function SummaryCards({ budgets }: SummaryCardsProps) {
  const total = budgets.reduce((sum, budget) => sum + budget.costs.total, 0);
  const average = budgets.length > 0 ? total / budgets.length : 0;

  // Transformamos os items adicionando propriedades de ícone e cores temáticas
  const items = [
    {
      label: "Orçamentos gerados",
      value: String(budgets.length),
      iconBg: "bg-brand-100 dark:bg-brand-900/30",
      iconColor: "text-brand-600 dark:text-brand-400",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
    },
    {
      label: "Valor total orçado",
      value: formatBRL(total),
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
    },
    {
      label: "Ticket médio",
      value: formatBRL(average),
      iconBg: "bg-violet-100 dark:bg-violet-900/30",
      iconColor: "text-violet-600 dark:text-violet-400",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          {/* Flexbox para alinhar ícone na esquerda e textos na direita */}
          <div className="flex items-center gap-4">
            
            {/* Caixinha do ícone com cor de fundo suave temática */}
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.iconBg} ${item.iconColor}`}>
              {item.icon}
            </div>
            
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              {/* tracking-tight deixa os números levemente mais próximos, passando um ar mais "limpo" e premium */}
              <p className="mt-0.5 truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {item.value}
              </p>
            </div>
            
          </div>
        </Card>
      ))}
    </div>
  );
}