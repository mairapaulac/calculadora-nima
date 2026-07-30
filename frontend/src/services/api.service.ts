import { AppConfig, Budget, BudgetInput } from "../types/budget.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message || "Erro ao comunicar com a API.");
  }

  return response.json() as Promise<T>;
}

export const apiService = {
  getConfig: () => request<AppConfig>("/config"),

  createBudget: (input: BudgetInput) =>
    request<Budget>("/budgets", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  listBudgets: () => request<Budget[]>("/budgets"),

  getBudget: (id: string) => request<Budget>(`/budgets/${id}`),

  downloadFile: async (id: string, format: "pdf" | "docx"): Promise<Blob> => {
    const response = await fetch(`${API_URL}/budgets/${id}/${format}`);
    if (!response.ok) {
      throw new Error("Erro ao gerar o documento do orcamento.");
    }
    return response.blob();
  },
};
