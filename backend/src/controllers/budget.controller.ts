import { Request, Response } from "express";
import { calculateBudget } from "../services/calculation.service";
import { createBudget, getBudgetById, listBudgets } from "../services/budget.service";
import { generateBudgetDocx } from "../services/docx.service";
import { generateBudgetPdf } from "../services/pdf.service";
import { BudgetInput } from "../types/budget.types";

/** Calcula o orcamento sem persistir - usado para simulacao instantanea no frontend. */
export function simulate(req: Request, res: Response): void {
  const input = req.body as BudgetInput;
  const result = calculateBudget(input);
  res.json(result);
}

/** Cria e persiste um orcamento completo. */
export function create(req: Request, res: Response): void {
  const input = req.body as BudgetInput;
  const budget = createBudget(input);
  res.status(201).json(budget);
}

export function list(_req: Request, res: Response): void {
  res.json(listBudgets());
}

export function getById(req: Request, res: Response): void {
  const budget = getBudgetById(req.params.id);
  if (!budget) {
    res.status(404).json({ message: "Orcamento nao encontrado." });
    return;
  }
  res.json(budget);
}

export async function downloadPdf(req: Request, res: Response): Promise<void> {
  const budget = getBudgetById(req.params.id);
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
  const budget = getBudgetById(req.params.id);
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
