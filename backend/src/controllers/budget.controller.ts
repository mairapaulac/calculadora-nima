import { Request, Response } from "express";
import { calculateBudgetTotals } from "../services/calculation.service";
import { createBudget, getBudgetById, listBudgets } from "../services/budget.service";
import { generateBudgetDocx } from "../services/docx.service";
import { generateBudgetPdf } from "../services/pdf.service";
import { BudgetInput } from "../types/budget.types";

/** Calcula o orcamento sem persistir - usado para simulacao instantanea no frontend. */
export function simulate(req: Request, res: Response): void {
  const input = req.body as BudgetInput;
  const result = calculateBudgetTotals(input);
  res.json(result);
}

/** Cria e persiste um orcamento completo. */
export async function create(req: Request, res: Response): Promise<void> {
  const input = req.body as BudgetInput;
  const budget = await createBudget(input);
  res.status(201).json(budget);
}

export async function list(_req: Request, res: Response): Promise<void> {
  res.json(await listBudgets());
}

export async function getById(req: Request, res: Response): Promise<void> {
  const budget = await getBudgetById(req.params.id);
  if (!budget) {
    res.status(404).json({ message: "Orcamento nao encontrado." });
    return;
  }
  res.json(budget);
}

export async function downloadPdf(req: Request, res: Response): Promise<void> {
  const budget = await getBudgetById(req.params.id);
  if (!budget) {
    res.status(404).json({ message: "Orcamento nao encontrado." });
    return;
  }

  const pdfBuffer = await generateBudgetPdf(budget);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="orcamento-${budget.budgetNumber}.pdf"`
  );
  res.send(pdfBuffer);
}

export async function downloadDocx(req: Request, res: Response): Promise<void> {
  const budget = await getBudgetById(req.params.id);
  if (!budget) {
    res.status(404).json({ message: "Orcamento nao encontrado." });
    return;
  }

  const docxBuffer = await generateBudgetDocx(budget);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="orcamento-${budget.budgetNumber}.docx"`
  );
  res.send(docxBuffer);
}
