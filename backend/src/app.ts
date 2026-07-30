import cors from "cors";
import express, { Application } from "express";
import { errorHandler } from "./middlewares/errorHandler";
import { apiRouter } from "./routes";

export function createApp(): Application {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", apiRouter);

  app.use(errorHandler);

  return app;
}
