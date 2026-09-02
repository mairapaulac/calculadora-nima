import { FormEvent, useState } from "react";
import { useBudgetForm } from "../../hooks/useBudgetForm";
import { apiService } from "../../services/api.service";
import { Card } from "../common/Card";
import { TextAreaInput } from "../common/TextAreaInput";
import { AdditionalServicesSection } from "./AdditionalServicesSection";
import { AttendantSection } from "./AttendantSection";
import { CostSummarySection } from "./CostSummarySection";
import { PrintItemsSection } from "./PrintItemsSection";
import { RequesterSection } from "./RequesterSection";
import { ScanItemsSection } from "./ScanItemsSection";

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

/** Estado do envio do orcamento para a base do Notion. */
type NotionState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent"; url: string }
  | { status: "error"; message: string };

export function BudgetForm({ onBudgetCreated }: BudgetFormProps) {
  const {
    config,
    configError,
    input,
    updateInput,
    totals,
    errors,
    submitting,
    submitError,
    lastBudget,
    submit,
    reset,
  } = useBudgetForm();
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);
  const [notion, setNotion] = useState<NotionState>({ status: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setNotion({ status: "idle" });
    const budget = await submit();
    if (budget) {
      onBudgetCreated?.();
    }
  }

  /** Cria a linha do orcamento na base do Notion, com o PDF ja anexado. */
  async function handleSendToNotion() {
    if (!lastBudget) return;
    setNotion({ status: "sending" });
    try {
      const { url } = await apiService.sendBudgetToNotion(lastBudget.id);
      setNotion({ status: "sent", url });
    } catch (error) {
      setNotion({
        status: "error",
        message: error instanceof Error ? error.message : "Erro ao enviar para o Notion.",
      });
    }
  }

  function handleReset() {
    reset();
    setNotion({ status: "idle" });
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
        <PrintItemsSection input={input} config={config} errors={errors} onChange={updateInput} />
        <ScanItemsSection input={input} config={config} errors={errors} onChange={updateInput} />
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
        <CostSummarySection input={input} totals={totals} />

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
                  onClick={handleSendToNotion}
                  disabled={notion.status === "sending" || notion.status === "sent"}
                  className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  {notion.status === "sending" && "Enviando pro Notion..."}
                  {notion.status === "sent" && "Enviado pro Notion ✓"}
                  {(notion.status === "idle" || notion.status === "error") && "Enviar pro Notion"}
                </button>

                {notion.status === "sent" && (
                  <a
                    href={notion.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-brand-700 underline underline-offset-2 dark:text-brand-200"
                  >
                    Abrir no Notion
                  </a>
                )}
                {notion.status === "error" && <p className="text-xs text-red-500">{notion.message}</p>}

                <button
                  type="button"
                  onClick={handleReset}
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
