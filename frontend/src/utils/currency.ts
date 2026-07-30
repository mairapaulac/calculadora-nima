/** Formata um numero como moeda brasileira (R$) para exibicao. */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(value) ? value : 0);
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Converte uma string digitada em um input de mascara monetaria (ex: "1.234,56")
 * para numero. Aceita tambem numeros simples digitados sem formatacao.
 */
export function parseCurrencyInput(raw: string): number {
  const digitsOnly = raw.replace(/\D/g, "");
  if (!digitsOnly) return 0;
  return Number(digitsOnly) / 100;
}

/** Formata um numero de centavos (inteiro) como texto de mascara monetaria "1.234,56". */
export function formatCurrencyInput(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
