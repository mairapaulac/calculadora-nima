import { Request, Response } from "express";
import { labMembers } from "../config/labMembers.config";
import { materialsList } from "../config/materials.config";
import { calculationParameters, labInfo } from "../config/pricing.config";

/** Expoe as configuracoes atuais (materiais, parametros de calculo e equipe) para o frontend. */
export function getConfig(_req: Request, res: Response): void {
  res.json({
    materials: materialsList,
    calculationParameters,
    labInfo,
    labMembers,
  });
}
