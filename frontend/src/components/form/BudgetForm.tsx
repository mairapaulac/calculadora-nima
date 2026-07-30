import { FormEvent, useState } from "react";
import { useBudgetForm } from "../../hooks/useBudgetForm";
import { apiService } from "../../services/api.service";
import { Card } from "../common/Card";
import { TextAreaInput } from "../common/TextAreaInput";
import { AdditionalServicesSection } from "./AdditionalServicesSection";
import { AttendantSection } from "./AttendantSection";
import { CostSummarySection } from "./CostSummarySection";
import { PrintSection } from "./PrintSection";
import { RequesterSection } from "./RequesterSection";

async function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

interface BudgetFormProps {
  onBudgetCreated?: () => void;
}

export function BudgetForm({ onBudgetCreated }: BudgetFormProps) {
  const {
    config,
    configError,
    input,
    updateInput,
    costs,
    errors,
    submitting,
    submitError,
    lastBudget,
    submit,
    reset,
  } = useBudgetForm();
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const budget = await submit();
    if (budget) {
      onBudgetCreated?.();
    }
  }

  async function handleDownload(format: "pdf" | "docx") {
    if (!lastBudget) return;
    setDownloading(format);
    try {
      const blob = await apiService.downloadFile(lastBudget.id, format);
      await downloadBlob(blob, `orcamento-${lastBudget.budgetNumber}.${format}`);
    } finally {
      setDownloading(null);
    }
  }

  if (configError) {
    return (
      <Card>
        <p className="text-sm text-red-500">{configError}</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <AttendantSection input={input} config={config} errors={errors} onChange={updateInput} />
        <RequesterSection input={input} errors={errors} onChange={updateInput} />
        <PrintSection input={input} config={config} errors={errors} onChange={updateInput} />
        <AdditionalServicesSection input={input} errors={errors} onChange={updateInput} />
        <Card title="Observações" subtitle="Campo livre para observações adicionais">
          <TextAreaInput
            label="Observações"
            value={input.notes || ""}
            onChange={(e) => updateInput((draft) => ({ ...draft, notes: e.target.value }))}
          />
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <CostSummarySection costs={costs} />

        <Card title="Gerar Orçamento">
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Gerando..." : "Gerar Orçamento"}
            </button>

            {submitError && <p className="text-xs text-red-500">{submitError}</p>}

            {lastBudget && (
              <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  Orçamento {lastBudget.budgetNumber} gerado com sucesso.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownload("pdf")}
                    disabled={downloading !== null}
                    className="flex-1 rounded-lg border border-brand-600 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-60 dark:text-brand-200"
                  >
                    {downloading === "pdf" ? "Gerando PDF..." : "Baixar PDF"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload("docx")}
                    disabled={downloading !== null}
                    className="flex-1 rounded-lg border border-brand-600 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50 disabled:opacity-60 dark:text-brand-200"
                  >
                    {downloading === "docx" ? "Gerando DOCX..." : "Baixar DOCX"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-700 dark:text-slate-400"
                >
                  Novo orçamento
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </form>
  );
}
