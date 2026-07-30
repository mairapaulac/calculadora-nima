import { db } from "../database/db";
import { Budget } from "../types/budget.types";

/**
 * Repositorio de orcamentos persistido em SQLite (arquivo local).
 *
 * O orcamento completo e guardado como JSON na coluna `payload` - suficiente
 * para o volume e a natureza deste sistema (sem consultas relacionais
 * complexas). Ao evoluir para um banco relacional/gerenciado (Postgres, etc.),
 * normalizar essas colunas em tabelas proprias e trocar apenas este arquivo,
 * mantendo a mesma interface publica (save/findById/list).
 */
const insertStmt = db.prepare(
  `INSERT INTO budgets (id, budget_number, created_at, payload) VALUES (@id, @budgetNumber, @createdAt, @payload)`
);
const selectByIdStmt = db.prepare(`SELECT payload FROM budgets WHERE id = ?`);
const selectAllStmt = db.prepare(`SELECT payload FROM budgets ORDER BY created_at DESC`);

function parseRow(row: { payload: string }): Budget {
  return JSON.parse(row.payload) as Budget;
}

class BudgetRepository {
  save(budget: Budget): Budget {
    insertStmt.run({
      id: budget.id,
      budgetNumber: budget.budgetNumber,
      createdAt: budget.createdAt,
      payload: JSON.stringify(budget),
    });
    return budget;
  }

  findById(id: string): Budget | undefined {
    const row = selectByIdStmt.get(id) as { payload: string } | undefined;
    return row ? parseRow(row) : undefined;
  }

  list(): Budget[] {
    const rows = selectAllStmt.all() as Array<{ payload: string }>;
    return rows.map(parseRow);
  }
}

export const budgetRepository = new BudgetRepository();
