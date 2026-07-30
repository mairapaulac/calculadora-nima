import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { labInfo } from "../config/pricing.config";
import { Budget } from "../types/budget.types";
import { formatBRL } from "../utils/currency.utils";

const CELL_MARGIN = { top: 100, bottom: 100, left: 150, right: 150 };

function headerCell(text: string): TableCell {
  return new TableCell({
    margins: CELL_MARGIN,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
  });
}

function valueCell(text: string, options?: { bold?: boolean }): TableCell {
  return new TableCell({
    margins: CELL_MARGIN,
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text, bold: options?.bold })],
      }),
    ],
  });
}

function labelCell(text: string, options?: { bold?: boolean }): TableCell {
  return new TableCell({
    margins: CELL_MARGIN,
    children: [new Paragraph({ children: [new TextRun({ text, bold: options?.bold })] })],
  });
}

/** Gera o DOCX do orcamento em memoria (Buffer), pronto para download ou envio por e-mail. */
export async function generateBudgetDocx(budget: Budget): Promise<Buffer> {
  const createdAt = new Date(budget.createdAt).toLocaleDateString("pt-BR");

  const costRows: Array<[string, number]> = [
    ["Material", budget.costs.materialCost],
    ["Custo de Maquina", budget.costs.machineCost],
    ["Modelagem 3D", budget.costs.modelingCost],
    ["Escaneamento 3D", budget.costs.scanningCost],
    ["Fatiamento", budget.costs.slicingCost],
  ];

  const costTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [headerCell("Item"), headerCell("Valor")] }),
      ...costRows.map(
        ([label, value]) =>
          new TableRow({ children: [labelCell(label), valueCell(formatBRL(value))] })
      ),
      new TableRow({
        children: [
          labelCell("Valor Total do Orcamento", { bold: true }),
          valueCell(formatBRL(budget.costs.total), { bold: true }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.TITLE,
            children: [new TextRun(labInfo.name)],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun("Orcamento de Manufatura Aditiva")],
          }),
          new Paragraph({ text: `Numero do orcamento: ${budget.budgetNumber}` }),
          new Paragraph({ text: `Data: ${createdAt}` }),
          new Paragraph({
            text: `Elaborado por: ${budget.input.attendedBy}`,
            spacing: { after: 200 },
          }),

          new Paragraph({ heading: HeadingLevel.HEADING_3, text: "Dados do Solicitante" }),
          new Paragraph({ text: `Nome: ${budget.input.requester.name}` }),
          new Paragraph({ text: `E-mail: ${budget.input.requester.email}` }),
          new Paragraph({
            text: `Departamento/Setor: ${budget.input.requester.department || "Nao informado"}`,
            spacing: { after: 200 },
          }),

          new Paragraph({ heading: HeadingLevel.HEADING_3, text: "Dados do Projeto" }),
          new Paragraph({ text: `Descricao: ${budget.input.requester.projectDescription}` }),
          new Paragraph({ text: `Material utilizado: ${budget.details.materialUsed.name}` }),
          new Paragraph({ text: `Peso da peca: ${budget.input.print.weightInGrams} g` }),
          new Paragraph({
            text: `Tempo de impressao: ${budget.input.print.printTime.hours}h ${budget.input.print.printTime.minutes}min`,
            spacing: { after: 200 },
          }),

          new Paragraph({ heading: HeadingLevel.HEADING_3, text: "Demonstrativo de Custos" }),
          costTable,

          new Paragraph({ heading: HeadingLevel.HEADING_3, text: "Observacoes", spacing: { before: 300 } }),
          new Paragraph({ text: budget.input.notes || "Nenhuma observacao.", spacing: { after: 400 } }),

          new Paragraph({
            spacing: { before: 600 },
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: "999999" } },
            children: [new TextRun(" ")],
          }),
          new Paragraph({ text: "Assinatura do responsavel" }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
