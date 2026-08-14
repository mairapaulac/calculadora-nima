import PDFDocument from "pdfkit";
import { optionsConfig } from "../config/options.config";
import { labInfo } from "../config/pricing.config";
import { Budget } from "../types/budget.types";
import { formatBRL } from "../utils/currency.utils";

/** Cores inspiradas na paleta "brand" do frontend (ver frontend/tailwind.config.js). */
const COLORS = {
  headerBg: "#eef4ff",
  title: "#182c66",
  text: "#1a3aa8",
  subtitle: "#5b6b9c",
  divider: "#b3cdff",
  total: "#182c66",
  footerText: "#5b6b9c",
};

interface DocumentLine {
  title: string;
  subtitle?: string;
  value: number;
}

/**
 * Fontes base do pdfkit (Helvetica) nao tem glifos de emoji - renderizam como
 * caracteres corrompidos. Os rotulos de complexidade usam emoji apenas para a
 * UI web; no documento do cliente removemos esses caracteres, mantendo so o texto.
 */
function complexityLabel(value: string): string {
  const label = optionsConfig.complexityOptions.find((o) => o.value === value)?.label || value;
  return label.replace(/[^\p{L}\p{N}\s]/gu, "").trim();
}

/** Monta as linhas de item (impressao + escaneamento + modelagem) exibidas no documento do cliente. */
function buildDocumentLines(budget: Budget): DocumentLine[] {
  const lines: DocumentLine[] = [];

  for (const item of budget.printItems) {
    const { hours, minutes } = item.input.printTime;
    lines.push({
      title: item.input.itemName,
      subtitle: `${item.materialUsed.name} · ${item.input.weightInGrams}g · ${hours}h${minutes ? ` ${minutes}min` : ""}`,
      value: item.costs.valorFinalCobrado,
    });
  }

  for (const item of budget.scanItems) {
    lines.push({
      title: item.input.itemName,
      subtitle: `Escaneamento 3D · ${complexityLabel(item.input.complexity)} · ${item.input.scanTimeHours}h`,
      value: item.costs.valorFinalCobrado,
    });
  }

  if (budget.input.services.modeling.enabled) {
    lines.push({ title: "Modelagem 3D", value: budget.modelingCost });
  }

  return lines;
}

/** Gera o PDF do orcamento em memoria (Buffer), no layout entregue ao cliente. */
export function generateBudgetPdf(budget: Budget): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const createdAt = new Date(budget.createdAt).toLocaleDateString("pt-BR");
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const startX = doc.page.margins.left;

    // Cabecalho
    doc.rect(0, 0, doc.page.width, 130).fill(COLORS.headerBg);
    doc
      .fillColor(COLORS.text)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(labInfo.name, startX, 40, { width: pageWidth - 150 });

    doc.fillColor(COLORS.title).font("Helvetica-Bold").fontSize(30).text("Orçamento", startX, 65);
    doc
      .fillColor(COLORS.subtitle)
      .font("Helvetica")
      .fontSize(10)
      .text(`Data: ${createdAt}`, startX, 65, { width: pageWidth, align: "right" });
    doc
      .fillColor(COLORS.subtitle)
      .fontSize(9)
      .text(`Orçamento ${budget.budgetNumber} · Elaborado por ${budget.input.attendedBy}`, startX, 105, {
        width: pageWidth,
      });

    doc.y = 150;
    doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(11);
    doc.text(`Solicitante: ${budget.input.requester.name}`, startX);
    doc.font("Helvetica").fontSize(10).fillColor(COLORS.subtitle);
    doc.text(budget.input.requester.email);
    doc.moveDown(1.5);

    doc
      .moveTo(startX, doc.y)
      .lineTo(startX + pageWidth, doc.y)
      .strokeColor(COLORS.divider)
      .stroke();
    doc.moveDown(1);

    // Itens
    const lines = buildDocumentLines(budget);
    lines.forEach((line) => {
      const rowStartY = doc.y;
      doc
        .fillColor(COLORS.title)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(line.title, startX, rowStartY, { width: pageWidth - 150 });

      if (line.subtitle) {
        doc
          .fillColor(COLORS.subtitle)
          .font("Helvetica")
          .fontSize(9)
          .text(line.subtitle, startX, doc.y, { width: pageWidth - 150 });
      }

      const leftColumnBottomY = doc.y;

      doc
        .fillColor(COLORS.title)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(formatBRL(line.value), startX, rowStartY, { width: pageWidth, align: "right" });

      // O texto do valor reposiciona doc.y para uma unica linha a partir de rowStartY,
      // o que fica menor que o fim do titulo/subtitulo quando o titulo quebra em 2 linhas -
      // sem este max(), a proxima linha de item sobrepoe o subtitulo desta.
      doc.y = Math.max(doc.y, leftColumnBottomY);
      doc.moveDown(1.2);
    });

    doc
      .moveTo(startX, doc.y)
      .lineTo(startX + pageWidth, doc.y)
      .strokeColor(COLORS.divider)
      .stroke();
    doc.moveDown(0.8);

    doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.total);
    doc.text("Total", startX, doc.y, { continued: true, width: pageWidth - 150 });
    doc.text(formatBRL(budget.total), startX, doc.y, { width: pageWidth, align: "right" });
    doc.moveDown(2);

    if (budget.input.notes) {
      doc.font("Helvetica-Bold").fontSize(10).fillColor(COLORS.title).text("Observações");
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.subtitle).text(budget.input.notes);
      doc.moveDown(1);
    }

    doc
      .fillColor(COLORS.subtitle)
      .font("Helvetica")
      .fontSize(9)
      .text("Este orçamento é válido por 15 dias.", startX, doc.y);

    // Rodape
    const footerY = doc.page.height - doc.page.margins.bottom - 50;
    doc
      .moveTo(startX, footerY)
      .lineTo(startX + pageWidth, footerY)
      .strokeColor(COLORS.divider)
      .stroke();

    doc
      .fillColor(COLORS.footerText)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Entre em contato por:", startX, footerY + 12, { continued: false });
    doc.font("Helvetica").text(labInfo.contactEmail || "");

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(`WhatsApp 1: ${labInfo.whatsapp1 || ""}`, startX, footerY + 12, {
        width: pageWidth,
        align: "right",
      });
    doc
      .font("Helvetica")
      .text(`WhatsApp 2: ${labInfo.whatsapp2 || ""}`, startX, doc.y, {
        width: pageWidth,
        align: "right",
      });

    doc.end();
  });
}
