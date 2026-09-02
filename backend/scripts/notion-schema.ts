import "dotenv/config";
import { notionConfig, notionProperties } from "../src/config/notion.config";
import { fetchPropertyTypes, fetchWorkspaceUsers } from "../src/services/notion.service";

/**
 * Lista as colunas da base do Notion (com o tipo de cada uma) e os usuarios do
 * workspace, conferindo se os nomes configurados em notion.config.ts existem.
 * Uso: npm run notion:schema
 */
async function main(): Promise<void> {
  console.log(`Base (data source): ${notionConfig.dataSourceId}\n`);

  const propertyTypes = await fetchPropertyTypes();

  console.log("Colunas encontradas:");
  for (const [name, type] of Object.entries(propertyTypes)) {
    console.log(`  - ${name}  (${type})`);
  }

  const users = await fetchWorkspaceUsers();
  console.log("\nUsuarios do workspace (para colunas do tipo Pessoa):");
  if (users.length === 0) {
    console.log("  (nenhum - a integracao pode nao ter permissao de ler usuarios)");
  }
  for (const user of users) {
    console.log(`  - ${user.name || "(sem nome)"}: ${user.id}`);
  }

  const missing = Object.entries(notionProperties).filter(
    ([, columnName]) => columnName && !propertyTypes[columnName]
  );

  if (missing.length === 0) {
    console.log("\nTodos os nomes configurados em notion.config.ts existem na base.");
    return;
  }

  console.log("\nConfigurados em notion.config.ts mas inexistentes na base:");
  for (const [field, columnName] of missing) {
    console.log(`  - ${field}: "${columnName}"`);
  }
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
