import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { optionsConfig } from "../config/options.config";
import { labInfo } from "../config/pricing.config";
import { Budget } from "../types/budget.types";
import { formatBRL } from "../utils/currency.utils";

const BRAND_TITLE = "182C66";
const BRAND_SUBTITLE = "5B6B9C";
const BRAND_HEADER_BG = "EEF4FF";
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };

/** Remove o emoji do rotulo (usado so na UI web) para manter o documento consistente. */
function complexityLabel(value: string): string {
  const label = optionsConfig.complexityOptions.find((o) => o.value === value)?.label || value;
  return label.replace(/[^\p{L}\p{N}\s]/gu, "").trim();
}

interface DocumentLine {
  title: string;
  subtitle?: string;
  value: number;
}

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

function itemRow(line: DocumentLine): TableRow {
  const titleParagraphs = [
    new Paragraph({
      children: [new TextRun({ text: line.title, bold: true, size: 24, color: BRAND_TITLE })],
    }),
  ];
  if (line.subtitle) {
    titleParagraphs.push(
      new Paragraph({
        children: [new TextRun({ text: line.subtitle, size: 18, color: BRAND_SUBTITLE })],
      })
    );
  }

  return new TableRow({
    children: [
      new TableCell({
        borders: NO_BORDERS,
        margins: { top: 120, bottom: 120, left: 0, right: 0 },
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: titleParagraphs,
      }),
      new TableCell({
        borders: NO_BORDERS,
        margins: { top: 120, bottom: 120, left: 0, right: 0 },
        width: { size: 30, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: formatBRL(line.value), bold: true, size: 24, color: BRAND_TITLE }),
            ],
          }),
        ],
      }),
    ],
  });
}

/** Gera o DOCX do orcamento em memoria (Buffer), no layout entregue ao cliente. */
export async function generateBudgetDocx(budget: Budget): Promise<Buffer> {
  const createdAt = new Date(budget.createdAt).toLocaleDateString("pt-BR");
  const lines = buildDocumentLines(budget);

  const itemsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: lines.map(itemRow),
  });

  const totalTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: NO_BORDERS,
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Total", bold: true, size: 28, color: BRAND_TITLE })],
              }),
            ],
          }),
          new TableCell({
            borders: NO_BORDERS,
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: formatBRL(budget.total), bold: true, size: 28, color: BRAND_TITLE }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: NO_BORDERS,
            shading: { type: ShadingType.CLEAR, fill: BRAND_HEADER_BG, color: "auto" },
            margins: { top: 300, bottom: 300, left: 200, right: 200 },
            width: { size: 65, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new TextRun({ text: labInfo.name, bold: true, size: 20, color: BRAND_SUBTITLE })],
              }),
              new Paragraph({
                heading: HeadingLevel.TITLE,
                children: [new TextRun({ text: "Orçamento", color: BRAND_TITLE })],
              }),
            ],
          }),
          new TableCell({
            borders: NO_BORDERS,
            shading: { type: ShadingType.CLEAR, fill: BRAND_HEADER_BG, color: "auto" },
            margins: { top: 300, bottom: 300, left: 200, right: 200 },
            width: { size: 35, type: WidthType.PERCENTAGE },
            verticalAlign: "center",
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: `Data: ${createdAt}`, color: BRAND_SUBTITLE })],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${budget.budgetNumber} · ${budget.input.attendedBy}`,
                    size: 16,
                    color: BRAND_SUBTITLE,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const children: (Paragraph | Table)[] = [
    headerTable,
    new Paragraph({ spacing: { before: 300 }, text: `Solicitante: ${budget.input.requester.name}` }),
    new Paragraph({
      spacing: { after: 300 },
      children: [new TextRun({ text: budget.input.requester.email, color: BRAND_SUBTITLE, size: 18 })],
    }),
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: "B3CDFF" } },
      spacing: { after: 300 },
      children: [new TextRun(" ")],
    }),
    itemsTable,
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: "B3CDFF" } },
      spacing: { before: 200, after: 200 },
      children: [new TextRun(" ")],
    }),
    totalTable,
  ];

  if (budget.input.notes) {
    children.push(
      new Paragraph({
        spacing: { before: 400 },
        children: [new TextRun({ text: "Observações", bold: true, color: BRAND_TITLE })],
      }),
      new Paragraph({
        children: [new TextRun({ text: budget.input.notes, color: BRAND_SUBTITLE, size: 18 })],
      })
    );
  }

  children.push(
    new Paragraph({
      spacing: { before: 400 },
      children: [
        new TextRun({ text: "Este orçamento é válido por 15 dias.", color: BRAND_SUBTITLE, size: 18 }),
      ],
    }),
    new Paragraph({
      spacing: { before: 300 },
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: "B3CDFF" } },
      children: [new TextRun(" ")],
    }),
    new Paragraph({
      spacing: { before: 200 },
      children: [
        new TextRun({ text: "Entre em contato por: ", bold: true, size: 18, color: BRAND_SUBTITLE }),
        new TextRun({ text: labInfo.contactEmail || "", size: 18, color: BRAND_SUBTITLE }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `WhatsApp 1: ${labInfo.whatsapp1 || ""}  ·  WhatsApp 2: ${labInfo.whatsapp2 || ""}`,
          size: 18,
          color: BRAND_SUBTITLE,
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
