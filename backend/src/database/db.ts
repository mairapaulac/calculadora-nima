import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

/**
 * Caminho do arquivo SQLite. Configuravel via DATABASE_PATH (ex: em producao,
 * apontar para um disco persistente). Por padrao, grava em backend/data/budgets.db.
 *
 * Usa o modulo nativo `node:sqlite` (Node.js >= 22.5) em vez de um pacote como
 * better-sqlite3 para evitar a necessidade de compilacao nativa (node-gyp/
 * Visual Studio Build Tools) em maquinas de desenvolvimento ou no build do
 * servico de hospedagem.
 */
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "..", "..", "data", "budgets.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new DatabaseSync(dbPath);

db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    budget_number TEXT NOT NULL,
    created_at TEXT NOT NULL,
    payload TEXT NOT NULL
  )
`);
