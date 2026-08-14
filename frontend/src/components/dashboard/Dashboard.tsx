import { Fragment, useEffect, useState } from "react";
import { apiService } from "../../services/api.service";
import { Budget, ComplexityLevel, PrintStatus } from "../../types/budget.types";
import { formatBRL } from "../../utils/currency";
import { Card } from "../common/Card";
import { SummaryCards } from "./SummaryCards";

interface DashboardProps {
  /** Alterar este valor força o dashboard a recarregar (ex: após gerar um novo orçamento). */
  refreshToken: number;
}

const STATUS_LABELS: Record<PrintStatus, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  EM_PRODUCAO: "Em Produção",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

const STATUS_BADGE_CLASSES: Record<PrintStatus, string> = {
  PENDENTE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  APROVADO: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  EM_PRODUCAO: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300",
  CONCLUIDO: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  CANCELADO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const COMPLEXITY_LABELS: Record<ComplexityLevel, string> = {
  BAIXA: "🟢 Baixa",
  MEDIA: "🟡 Média",
  ALTA: "🔴 Alta",
};

function StatusBadge({ status }: { status: PrintStatus }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function BudgetItemsDetail({ budget }: { budget: Budget }) {
  return (
    <div className="flex flex-col gap-4 bg-slate-50 p-4 dark:bg-slate-900/40">
      {budget.printItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Impressão 3D
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500">
                  <th className="py-1 pr-3">Código</th>
                  <th className="py-1 pr-3">Peça</th>
                  <th className="py-1 pr-3">Material</th>
                  <th className="py-1 pr-3">Status</th>
                  <th className="py-1 pr-3 text-right">Subtotal NIMA</th>
                  <th className="py-1 pr-3 text-right">Taxa EJ (20%)</th>
                  <th className="py-1 pr-3 text-right">Custo Insumo</th>
                  <th className="py-1 pr-3 text-right">Lucro Lab</th>
                  <th className="py-1 pr-3 text-right">Valor Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {budget.printItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1.5 pr-3 font-mono text-slate-500">{item.code}</td>
                    <td className="py-1.5 pr-3 font-medium text-slate-700 dark:text-slate-200">
                      {item.input.itemName}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-500">{item.materialUsed.name}</td>
                    <td className="py-1.5 pr-3">
                      <StatusBadge status={item.input.status} />
                    </td>
                    <td className="py-1.5 pr-3 text-right text-slate-500">
                      {formatBRL(item.costs.subtotalNima)}
                    </td>
                    <td className="py-1.5 pr-3 text-right text-slate-500">{formatBRL(item.costs.taxaEJ)}</td>
                    <td className="py-1.5 pr-3 text-right text-slate-500">
                      {formatBRL(item.input.custoInsumo)}
                    </td>
                    <td className="py-1.5 pr-3 text-right text-slate-500">{formatBRL(item.costs.lucroLab)}</td>
                    <td className="py-1.5 pr-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                      {formatBRL(item.costs.valorFinalCobrado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {budget.scanItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Escaneamento 3D
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500">
                  <th className="py-1 pr-3">Código</th>
                  <th className="py-1 pr-3">Peça</th>
                  <th className="py-1 pr-3">Complexidade</th>
                  <th className="py-1 pr-3">Pós-Processamento/Malha</th>
                  <th className="py-1 pr-3">Status</th>
                  <th className="py-1 pr-3 text-right">Valor Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {budget.scanItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1.5 pr-3 font-mono text-slate-500">{item.code}</td>
                    <td className="py-1.5 pr-3 font-medium text-slate-700 dark:text-slate-200">
                      {item.input.itemName}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-500">
                      {COMPLEXITY_LABELS[item.input.complexity]}
                    </td>
                    <td className="py-1.5 pr-3 text-slate-500">{item.input.postProcessing}</td>
                    <td className="py-1.5 pr-3">
                      <StatusBadge status={item.input.status} />
                    </td>
                    <td className="py-1.5 pr-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                      {formatBRL(item.costs.valorFinalCobrado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {budget.input.services.modeling.enabled && (
        <p className="text-xs text-slate-500">
          Modelagem 3D: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatBRL(budget.modelingCost)}</span>
        </p>
      )}
    </div>
  );
}

export function Dashboard({ refreshToken }: DashboardProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiService
      .listBudgets()
      .then(setBudgets)
      .catch(() => setError("Não foi possível carregar os orçamentos."))
      .finally(() => setLoading(false));
  }, [refreshToken]);

  return (
    <div className="flex flex-col gap-8">
      <SummaryCards budgets={budgets} />

      <Card title="Orçamentos Recentes">
        {/* --- ESTADO DE ERRO --- */}
        {error && (
          <div className="my-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* --- ESTADO DE CARREGAMENTO (SKELETON) --- */}
        {loading && (
          <div className="mt-4 flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex h-12 w-full animate-pulse items-center rounded-md bg-slate-100 dark:bg-slate-800/50" />
            ))}
          </div>
        )}

        {/* --- ESTADO VAZIO (EMPTY STATE) --- */}
        {!loading && !error && budgets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Nenhum orçamento</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Os orçamentos gerados aparecerão aqui.
            </p>
          </div>
        )}

        {/* --- TABELA DE DADOS --- */}
        {!loading && !error && budgets.length > 0 && (
          <div className="mt-4 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full align-middle px-4 sm:px-6 lg:px-8">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th scope="col" className="py-3 pr-4 pl-2">Número</th>
                    <th scope="col" className="py-3 px-4">Solicitante</th>
                    <th scope="col" className="py-3 px-4">Itens</th>
                    <th scope="col" className="py-3 px-4">Data</th>
                    <th scope="col" className="py-3 pl-4 pr-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {budgets.map((budget) => {
                    const isExpanded = expandedId === budget.id;
                    const itemCount = budget.printItems.length + budget.scanItems.length;
                    return (
                      <Fragment key={budget.id}>
                        <tr
                          onClick={() => setExpandedId(isExpanded ? null : budget.id)}
                          className="group cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
                        >
                          <td className="whitespace-nowrap py-3 pr-4 pl-2 font-medium text-slate-900 dark:text-slate-100">
                            {budget.budgetNumber}
                            <span className="block text-xs font-normal text-slate-500">
                              por {budget.input.attendedBy}
                            </span>
                          </td>
                          <td className="whitespace-nowrap py-3 px-4 text-slate-600 dark:text-slate-300">
                            {budget.input.requester.name}
                          </td>
                          <td className="whitespace-nowrap py-3 px-4 text-slate-500">
                            {budget.printItems.length > 0 && `${budget.printItems.length} impressão(ões)`}
                            {budget.printItems.length > 0 && budget.scanItems.length > 0 && " · "}
                            {budget.scanItems.length > 0 && `${budget.scanItems.length} escaneamento(s)`}
                            {itemCount === 0 && "—"}
                          </td>
                          <td className="whitespace-nowrap py-3 px-4 text-slate-500">
                            {new Date(budget.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                          <td className="whitespace-nowrap py-3 pl-4 pr-2 text-right font-semibold text-slate-900 dark:text-slate-100">
                            {formatBRL(budget.total)}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="p-0">
                              <BudgetItemsDetail budget={budget} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
