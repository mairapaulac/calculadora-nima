import { db } from "../database/db";

const countStmt = db.prepare(`SELECT COUNT(*) as count FROM budgets`);

/**
 * Gera um numero de orcamento legivel: NIMA-AAAA-000001.
 * A sequencia e derivada da quantidade de orcamentos ja persistidos no
 * SQLite, garantindo que nao se repita apos reinicios do processo.
 */
export function generateBudgetNumber(date: Date = new Date()): string {
  const { count } = countStmt.get() as { count: number };
  const year = date.getFullYear();
  const sequence = String(count + 1).padStart(6, "0");
  return `NIMA-${year}-${sequence}`;
}
