import { Router } from "express";
import { getConfig } from "../controllers/materials.controller";

export const configRouter = Router();

configRouter.get("/", getConfig);
