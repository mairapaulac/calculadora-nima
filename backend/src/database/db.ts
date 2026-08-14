import { neon, NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Conexao com Postgres (Neon) via connection string em DATABASE_URL.
 *
 * Usa o driver HTTP do Neon (@neondatabase/serverless) em vez do driver TCP
 * tradicional (`pg`): o driver HTTP fala por HTTPS (porta 443), o que evita
 * bloqueios de rede/firewall na porta 5432 do Postgres (comum em redes
 * corporativas/escolares) e funciona bem para o padrao de uso deste app
 * (uma query por vez, sem transacoes multi-statement).
 *
 * Trocado de SQLite local (node:sqlite) para Postgres externo porque, em
 * hospedagens com filesystem efemero (ex: Render free), o arquivo SQLite
 * local e apagado a cada novo deploy ou reinicio do container - os dados
 * precisam morar fora do processo da API.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL nao definida. Configure a connection string do banco Postgres (ex: Neon) em backend/.env."
  );
}

export const sql: NeonQueryFunction<false, false> = neon(connectionString);

export async function initDatabase(): Promise<void> {
  await sql.query(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      budget_number TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      payload JSONB NOT NULL
    )
  `);

  await sql.query(`
    CREATE TABLE IF NOT EXISTS counters (
      key TEXT PRIMARY KEY,
      value INTEGER NOT NULL DEFAULT 0
    )
  `);
}
