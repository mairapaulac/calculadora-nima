import { useEffect, useState } from "react";
import { apiService } from "../../services/api.service";
import { Budget } from "../../types/budget.types";
import { formatBRL } from "../../utils/currency";
import { Card } from "../common/Card";
import { SummaryCards } from "./SummaryCards";

interface DashboardProps {
  /** Alterar este valor forca o dashboard a recarregar (ex: apos gerar um novo orcamento). */
  refreshToken: number;
}

export function Dashboard({ refreshToken }: DashboardProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiService
      .listBudgets()
      .then(setBudgets)
      .catch(() => setError("Não foi possível carregar os orçamentos."))
      .finally(() => setLoading(false));
  }, [refreshToken]);

  return (
    <div className="flex flex-col gap-6">
      <SummaryCards budgets={budgets} />

      <Card title="Orçamentos Recentes">
        {loading && <p className="text-sm text-slate-500">Carregando...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && budgets.length === 0 && (
          <p className="text-sm text-slate-500">Nenhum orçamento gerado ainda.</p>
        )}
        {!loading && budgets.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700">
                  <th className="py-2 pr-4">Número</th>
                  <th className="py-2 pr-4">Elaborado por</th>
                  <th className="py-2 pr-4">Solicitante</th>
                  <th className="py-2 pr-4">Material</th>
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => (
                  <tr
                    key={budget.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="py-2 pr-4 font-medium">{budget.budgetNumber}</td>
                    <td className="py-2 pr-4">{budget.input.attendedBy}</td>
                    <td className="py-2 pr-4">{budget.input.requester.name}</td>
                    <td className="py-2 pr-4">{budget.details.materialUsed.name}</td>
                    <td className="py-2 pr-4">
                      {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {formatBRL(budget.costs.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
