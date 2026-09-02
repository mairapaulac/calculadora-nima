/**
 * Integracao com o Notion: envia o orcamento gerado para a base do laboratorio,
 * com o PDF anexado, sem ninguem precisar baixar e anexar na mao.
 *
 * Depende de dois passos fora do codigo:
 * 1. Criar uma integracao interna em notion.so/my-integrations e por o token
 *    em NOTION_TOKEN (backend/.env e nas variaveis do Render).
 * 2. Compartilhar a base com essa integracao (pagina da base -> Conexoes).
 *    Sem isso a API responde 404 mesmo com o ID correto.
 */
export const notionConfig = {
  token: process.env.NOTION_TOKEN || "",
  /** Data source ("planilha") onde cada orcamento vira uma linha. */
  dataSourceId: process.env.NOTION_DATA_SOURCE_ID ,
  apiVersion: process.env.NOTION_VERSION || "2026-03-11",
};

/**
 * De-para entre os dados do orcamento e os nomes das colunas da base.
 * Os nomes precisam bater exatamente com os do Notion (inclusive acentos e
 * maiusculas); deixe "" para nao preencher aquela coluna.
 *
 * O tipo de cada coluna e lido do proprio Notion em tempo de execucao, entao
 * so os nomes precisam ser ajustados aqui. Rode `npm run notion:schema` para
 * listar as colunas da base e conferir.
 */
export const notionProperties = {
  /** Coluna titulo - recebe "Nome do solicitante (Departamento)". */
  requester: "Nome do Demandante",
  /**
   * "ID do orçamento" (ORC-000) e uma formula da base, gerada pelo proprio
   * Notion e somente leitura pela API - por isso nao e preenchida aqui.
   * O numero interno (NIMA-AAAA-000000) vai no nome do PDF anexado.
   * Para grava-lo em coluna propria, crie uma coluna de Texto e aponte aqui.
   */
  budgetNumber: "",
  /** Valor total do orcamento. Ignorada se for rollup/formula. */
  total: "Valor do Orçamento",
  /** Quem elaborou o orcamento (input.attendedBy) - coluna do tipo Pessoa. */
  attendedBy: "Requerido",
  /** Coluna de anexo - recebe o PDF do orcamento. */
  attachment: "Arquivos e mídia",
  /** Data de criacao do orcamento. Vazio = base nao tem essa coluna. */
  createdAt: "",
};

/**
 * Colunas do tipo "Pessoa" so aceitam o id do usuario no Notion, nao o nome.
 * Este de-para liga cada integrante de labMembers.config.ts ao usuario dele no
 * workspace; quem nao estiver aqui e resolvido por nome (busca em /v1/users) e,
 * se nao houver correspondencia, a coluna fica vazia e a linha e criada mesmo assim.
 *
 * Rode `npm run notion:schema` para listar os usuarios e preencher os ids.
 */
export const notionUserIdsByLabMember: Record<string, string> = {
  Maicon: "e74a3c14-96d9-4707-8f73-38842f8605c6",
  Kathelean: "1cfa1b1d-e1f8-400b-bf08-a12e1ee5e9f6",
  "Ana Rebeca": "604b234d-fe71-432b-a2bf-5c90bad1c685",
  Geovana: "d082358a-231f-4ba7-a53e-0f14a2e81dd4",
  // No Notion aparece como "Francisco Vinicius De Sousa Leonor" - o nome do
  // laboratorio e o sobrenome, entao a busca automatica nao acharia.
  Leonor: "1bcd872b-594c-8135-9660-0002015a62d4",
  Rafael: "345ef163-a5a2-4cfe-9b99-764cdf0a8f61",
  Maíra: "e5fc8c44-dfcc-4bec-a357-7304dbc57a6f",
  Giovanna: "88407f1d-d28d-4265-b1e2-814209d3149d",
  Igor: "1c1d872b-594c-81aa-9005-0002e96c65d3",
  Karen: "f7bcfed2-b43d-4ab4-8704-c0dcc0bda0d6",
  Klivia: "2bdd872b-594c-81d0-bf00-000293f63948",
};
