import { notionConfig, notionProperties, notionUserIdsByLabMember } from "../config/notion.config";
import { Budget } from "../types/budget.types";
import { formatBRL } from "../utils/currency.utils";
import { generateBudgetPdf } from "./pdf.service";

const NOTION_API_BASE = "https://api.notion.com/v1";

type PropertyValue = Record<string, unknown>;

interface DataSourceResponse {
  properties: Record<string, { id: string; name: string; type: string }>;
}

interface NotionUser {
  id: string;
  name?: string | null;
  type?: string;
}

/** Chamada autenticada na API do Notion, com erro legivel para o operador. */
async function notionRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!notionConfig.token) {
    throw new Error(
      "NOTION_TOKEN nao configurada - crie uma integracao em notion.so/my-integrations e defina a variavel."
    );
  }

  if (!notionConfig.dataSourceId) {
    throw new Error(
      "NOTION_DATA_SOURCE_ID nao configurada - defina o id da base do Notion no .env."
    );
  }

  const response = await fetch(`${NOTION_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${notionConfig.token}`,
      "Notion-Version": notionConfig.apiVersion,
      ...(init.headers || {}),
    },
  });

  const body = (await response.json().catch(() => null)) as { message?: string } | null;

  if (!response.ok) {
    const detail = body?.message || response.statusText;
    const hint =
      response.status === 404
        ? " Verifique se a base foi compartilhada com a integracao (pagina da base -> Conexoes)."
        : "";
    throw new Error(`Notion respondeu ${response.status}: ${detail}.${hint}`);
  }

  return body as T;
}

/**
 * Tipos das colunas da base, lidos do proprio Notion (nome -> tipo).
 * Cacheado no processo: o schema muda raramente e evita uma chamada por envio.
 */
let cachedPropertyTypes: Record<string, string> | null = null;

export async function fetchPropertyTypes(): Promise<Record<string, string>> {
  if (cachedPropertyTypes) return cachedPropertyTypes;

  const dataSource = await notionRequest<DataSourceResponse>(
    `/data_sources/${notionConfig.dataSourceId}`
  );

  cachedPropertyTypes = Object.fromEntries(
    Object.entries(dataSource.properties).map(([name, property]) => [name, property.type])
  );
  return cachedPropertyTypes;
}

/** Usuarios do workspace, para resolver colunas do tipo "Pessoa". */
let cachedUsers: NotionUser[] | null = null;

export async function fetchWorkspaceUsers(): Promise<NotionUser[]> {
  if (cachedUsers) return cachedUsers;

  try {
    const data = await notionRequest<{ results: NotionUser[] }>("/users?page_size=100");
    cachedUsers = data.results.filter((user) => user.type === "person");
  } catch (error) {
    // Listar usuarios exige a capacidade "informacoes do usuario" na integracao.
    // Sem ela a linha ainda e criada, so a coluna de pessoa fica vazia.
    console.warn(
      `Notion: nao foi possivel listar os usuarios do workspace (${
        error instanceof Error ? error.message : error
      }).`
    );
    cachedUsers = [];
  }

  return cachedUsers;
}

/** Remove acentos e caixa para comparar nomes vindos de fontes diferentes. */
function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Liga o integrante do laboratorio ao usuario dele no Notion: primeiro pelo
 * de-para explicito, depois por nome (igual ou primeiro nome) no workspace.
 */
async function resolveNotionUserId(labMember: string): Promise<string | null> {
  const configured = notionUserIdsByLabMember[labMember];
  if (configured) return configured;

  const target = normalizeName(labMember);
  const users = await fetchWorkspaceUsers();
  const match = users.find((user) => {
    const name = normalizeName(user.name || "");
    return name === target || name.startsWith(`${target} `);
  });

  return match?.id || null;
}

/**
 * Upload do PDF em duas etapas (criar o upload e enviar o conteudo), como exige
 * a File Upload API. Retorna o id usado para anexar o arquivo na linha criada.
 */
async function uploadPdf(filename: string, pdf: Buffer): Promise<string> {
  const upload = await notionRequest<{ id: string }>("/file_uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "single_part",
      filename,
      content_type: "application/pdf",
    }),
  });

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(pdf)], { type: "application/pdf" }), filename);

  // Sem Content-Type manual: o fetch monta o boundary do multipart.
  await notionRequest(`/file_uploads/${upload.id}/send`, { method: "POST", body: form });

  return upload.id;
}

/** Converte um texto para o formato da coluna, conforme o tipo dela no Notion. */
function textValue(type: string, value: string): PropertyValue | null {
  switch (type) {
    case "title":
      return { title: [{ text: { content: value } }] };
    case "rich_text":
      return { rich_text: [{ text: { content: value } }] };
    case "select":
      return { select: { name: value } };
    case "status":
      return { status: { name: value } };
    default:
      return null;
  }
}

/**
 * Monta o payload de propriedades da linha respeitando o tipo real de cada
 * coluna. Coluna configurada que nao existe na base e erro (nome errado);
 * coluna de tipo que nao sabemos preencher e apenas ignorada, com aviso no log.
 */
function buildProperties(
  budget: Budget,
  propertyTypes: Record<string, string>,
  fileUploadId: string,
  attendedByUserId: string | null
): Record<string, PropertyValue> {
  const properties: Record<string, PropertyValue> = {};
  const skipped: string[] = [];

  function set(columnName: string, build: (type: string) => PropertyValue | null): void {
    if (!columnName) return;

    const type = propertyTypes[columnName];
    if (!type) {
      throw new Error(
        `A coluna "${columnName}" nao existe na base do Notion. Colunas disponiveis: ${Object.keys(
          propertyTypes
        ).join(", ")}. Ajuste backend/src/config/notion.config.ts.`
      );
    }

    const value = build(type);
    if (value) {
      properties[columnName] = value;
    } else {
      skipped.push(`${columnName} (tipo "${type}")`);
    }
  }

  const { name, department } = budget.input.requester;
  const requesterLabel = department ? `${name} (${department})` : name;

  set(notionProperties.requester, (type) => textValue(type, requesterLabel));
  set(notionProperties.budgetNumber, (type) => textValue(type, budget.budgetNumber));
  set(notionProperties.attendedBy, (type) =>
    type === "people"
      ? attendedByUserId
        ? { people: [{ id: attendedByUserId }] }
        : null
      : textValue(type, budget.input.attendedBy)
  );
  set(notionProperties.total, (type) =>
    type === "number" ? { number: budget.total } : textValue(type, formatBRL(budget.total))
  );
  set(notionProperties.createdAt, (type) =>
    type === "date" ? { date: { start: budget.createdAt } } : null
  );
  set(notionProperties.attachment, (type) =>
    type === "files"
      ? {
          files: [
            {
              type: "file_upload",
              file_upload: { id: fileUploadId },
              name: `orcamento-${budget.budgetNumber}.pdf`,
            },
          ],
        }
      : null
  );

  if (skipped.length > 0) {
    console.warn(
      `Notion: colunas nao preenchidas: ${skipped.join("; ")}.` +
        " Tipos calculados (formula/rollup/ID) sao somente leitura; colunas 'Pessoa'" +
        " precisam do id do usuario - preencha notionUserIdsByLabMember se o nome nao bater."
    );
  }

  return properties;
}

/** Gera o PDF do orcamento e cria a linha correspondente na base do Notion. */
export async function sendBudgetToNotion(budget: Budget): Promise<string> {
  const propertyTypes = await fetchPropertyTypes();

  const attendedByUserId =
    propertyTypes[notionProperties.attendedBy] === "people"
      ? await resolveNotionUserId(budget.input.attendedBy)
      : null;

  const pdf = await generateBudgetPdf(budget);
  const fileUploadId = await uploadPdf(`orcamento-${budget.budgetNumber}.pdf`, pdf);

  const page = await notionRequest<{ url: string }>("/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      parent: { type: "data_source_id", data_source_id: notionConfig.dataSourceId },
      properties: buildProperties(budget, propertyTypes, fileUploadId, attendedByUserId),
    }),
  });

  return page.url;
}
