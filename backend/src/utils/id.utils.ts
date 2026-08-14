import { sql } from "../database/db";

/**
 * Incrementa atomicamente um contador nomeado (ex: "budget", "orc", "esc")
 * usando upsert do Postgres, e retorna o novo valor. Usado para gerar
 * numeros/codigos sequenciais sem depender de contar linhas (o que quebraria
 * sob concorrencia e nao faz mais sentido agora que os itens vivem dentro
 * do payload JSON do orcamento, nao em tabelas proprias).
 */
async function nextSequence(key: string): Promise<number> {
  const rows = await sql.query(
    `INSERT INTO counters (key, value) VALUES ($1, 1)
     ON CONFLICT (key) DO UPDATE SET value = counters.value + 1
     RETURNING value`,
    [key]
  );
  return (rows[0] as { value: number }).value;
}

/** Gera um numero de orcamento legivel: NIMA-AAAA-000001. */
export async function generateBudgetNumber(date: Date = new Date()): Promise<string> {
  const sequence = await nextSequence("budget");
  const year = date.getFullYear();
  return `NIMA-${year}-${String(sequence).padStart(6, "0")}`;
}

/** Gera o codigo de um item de impressao: ORC-001. */
export async function generatePrintItemCode(): Promise<string> {
  const sequence = await nextSequence("orc");
  return `ORC-${String(sequence).padStart(3, "0")}`;
}

/** Gera o codigo de um item de escaneamento: ESC-001. */
export async function generateScanItemCode(): Promise<string> {
  const sequence = await nextSequence("esc");
  return `ESC-${String(sequence).padStart(3, "0")}`;
}
