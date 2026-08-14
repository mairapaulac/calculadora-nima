import { sql } from "../database/db";
import { Budget } from "../types/budget.types";

/** payload chega como objeto (JSONB) via driver HTTP, mas normaliza caso venha como texto. */
function parsePayload(payload: unknown): Budget {
  return typeof payload === "string" ? (JSON.parse(payload) as Budget) : (payload as Budget);
}

/**
 * Repositorio de orcamentos persistido em Postgres.
 *
 * O orcamento completo e guardado como JSON na coluna `payload` - suficiente
 * para o volume e a natureza deste sistema (sem consultas relacionais
 * complexas). Ao evoluir para tabelas normalizadas, trocar apenas este
 * arquivo, mantendo a mesma interface publica (save/findById/list).
 */
class BudgetRepository {
  async save(budget: Budget): Promise<Budget> {
    await sql.query(
      `INSERT INTO budgets (id, budget_number, created_at, payload) VALUES ($1, $2, $3, $4)`,
      [budget.id, budget.budgetNumber, budget.createdAt, JSON.stringify(budget)]
    );
    return budget;
  }

  async findById(id: string): Promise<Budget | undefined> {
    const rows = await sql.query(`SELECT payload FROM budgets WHERE id = $1`, [id]);
    const row = rows[0] as { payload: unknown } | undefined;
    return row ? parsePayload(row.payload) : undefined;
  }

  async list(): Promise<Budget[]> {
    const rows = await sql.query(`SELECT payload FROM budgets ORDER BY created_at DESC`);
    return (rows as Array<{ payload: unknown }>).map((row) => parsePayload(row.payload));
  }
}

export const budgetRepository = new BudgetRepository();
