import PDFDocument from "pdfkit";
import { labInfo } from "../config/pricing.config";
import { Budget } from "../types/budget.types";
import { formatBRL } from "../utils/currency.utils";

const SERVICE_LABELS = {
  material: "Material",
  machine: "Custo de Maquina",
  modeling: "Modelagem 3D",
  scanning: "Escaneamento 3D",
  slicing: "Fatiamento",
} as const;

/** Gera o PDF do orcamento em memoria (Buffer), pronto para download ou envio por e-mail. */
export function generateBudgetPdf(budget: Budget): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const createdAt = new Date(budget.createdAt).toLocaleDateString("pt-BR");

    // Cabecalho
    doc.fontSize(18).font("Helvetica-Bold").text(labInfo.name, { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).font("Helvetica-Bold").text("Orcamento de Manufatura Aditiva", {
      align: "center",
    });
    doc.moveDown(1);

    doc.fontSize(10).font("Helvetica");
    doc.text(`Numero do orcamento: ${budget.budgetNumber}`);
    doc.text(`Data: ${createdAt}`);
    doc.text(`Elaborado por: ${budget.input.attendedBy}`);
    doc.moveDown(1);

    // Dados do solicitante
    sectionTitle(doc, "Dados do Solicitante");
    doc.font("Helvetica").fontSize(10);
    doc.text(`Nome: ${budget.input.requester.name}`);
    doc.text(`E-mail: ${budget.input.requester.email}`);
    doc.text(`Departamento/Setor: ${budget.input.requester.department || "Nao informado"}`);
    doc.moveDown(1);

    // Dados do projeto
    sectionTitle(doc, "Dados do Projeto");
    doc.font("Helvetica").fontSize(10);
    doc.text(`Descricao: ${budget.input.requester.projectDescription}`);
    doc.text(`Material utilizado: ${budget.details.materialUsed.name}`);
    doc.text(`Peso da peca: ${budget.input.print.weightInGrams} g`);
    doc.text(
      `Tempo de impressao: ${budget.input.print.printTime.hours}h ${budget.input.print.printTime.minutes}min`
    );
    doc.moveDown(1);

    // Demonstrativo de custos
    sectionTitle(doc, "Demonstrativo de Custos");
    doc.moveDown(0.5);
    renderCostTable(doc, budget);
    doc.moveDown(1);

    // Observacoes
    sectionTitle(doc, "Observacoes");
    doc.font("Helvetica").fontSize(10).text(budget.input.notes || "Nenhuma observacao.");
    doc.moveDown(2);

    // Assinatura
    doc.moveDown(2);
    doc.text("____________________________________________");
    doc.text("Assinatura do responsavel");

    doc.end();
  });
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  doc.font("Helvetica-Bold").fontSize(12).text(title);
  doc.moveDown(0.3);
}

function renderCostTable(doc: PDFKit.PDFDocument, budget: Budget): void {
  const rows: Array<[string, number]> = [
    [SERVICE_LABELS.material, budget.costs.materialCost],
    [SERVICE_LABELS.machine, budget.costs.machineCost],
    [SERVICE_LABELS.modeling, budget.costs.modelingCost],
    [SERVICE_LABELS.scanning, budget.costs.scanningCost],
    [SERVICE_LABELS.slicing, budget.costs.slicingCost],
  ];

  const startX = doc.x;
  const colItemWidth = 300;

  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("Item", startX, doc.y, { continued: false, width: colItemWidth });
  doc.text("Valor", startX + colItemWidth, doc.y - doc.currentLineHeight(), {
    width: 150,
    align: "right",
  });
  doc.moveDown(0.3);
  doc
    .moveTo(startX, doc.y)
    .lineTo(startX + colItemWidth + 150, doc.y)
    .strokeColor("#cccccc")
    .stroke();
  doc.moveDown(0.3);

  doc.font("Helvetica").fontSize(10);
  rows.forEach(([label, value]) => {
    const y = doc.y;
    doc.text(label, startX, y, { width: colItemWidth });
    doc.text(formatBRL(value), startX + colItemWidth, y, { width: 150, align: "right" });
    doc.moveDown(0.2);
  });

  doc
    .moveTo(startX, doc.y)
    .lineTo(startX + colItemWidth + 150, doc.y)
    .strokeColor("#cccccc")
    .stroke();
  doc.moveDown(0.3);

  doc.font("Helvetica-Bold").fontSize(11);
  const totalY = doc.y;
  doc.text("Valor Total do Orcamento", startX, totalY, { width: colItemWidth });
  doc.text(formatBRL(budget.costs.total), startX + colItemWidth, totalY, {
    width: 150,
    align: "right",
  });
}
