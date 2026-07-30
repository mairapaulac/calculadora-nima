import { Router } from "express";
import { budgetRouter } from "./budget.routes";
import { configRouter } from "./materials.routes";

export const apiRouter = Router();

apiRouter.use("/budgets", budgetRouter);
apiRouter.use("/config", configRouter);
