import "dotenv/config";
import { createApp } from "./app";
import { initDatabase } from "./database/db";

const port = Number(process.env.PORT) || 3333;

initDatabase()
  .then(() => {
    const app = createApp();
    app.listen(port, () => {
      console.log(`API do Orcamento NIMA rodando em http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Falha ao conectar/preparar o banco de dados:", error);
    process.exit(1);
  });
