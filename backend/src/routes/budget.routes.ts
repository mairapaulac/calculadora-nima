import { Router } from "express";
import {
  create,
  downloadDocx,
  downloadPdf,
  getById,
  list,
  simulate,
} from "../controllers/budget.controller";
import { validateBody } from "../middlewares/validateBody";
import { asyncHandler } from "../utils/asyncHandler";
import { budgetInputSchema } from "../validators/budget.validator";

export const budgetRouter = Router();

budgetRouter.post("/simulate", validateBody(budgetInputSchema), simulate);
budgetRouter.post("/", validateBody(budgetInputSchema), asyncHandler(create));
budgetRouter.get("/", asyncHandler(list));
budgetRouter.get("/:id", asyncHandler(getById));
budgetRouter.get("/:id/pdf", asyncHandler(downloadPdf));
budgetRouter.get("/:id/docx", asyncHandler(downloadDocx));
