import { PrintTime } from "../types/budget.types";

/** Converte horas e minutos em horas decimais para uso nos calculos internos. */
export function toDecimalHours(time: PrintTime): number {
  return time.hours + time.minutes / 60;
}
