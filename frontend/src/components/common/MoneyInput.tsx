import { formatCurrencyInput, parseCurrencyInput } from "../../utils/currency";

interface MoneyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

/** Input com mascara monetaria em Real (BRL), digitado como centavos (ex: 12345 -> R$ 123,45). */
export function MoneyInput({ label, value, onChange, error }: MoneyInputProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          R$
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          value={formatCurrencyInput(value)}
          onChange={(e) => onChange(parseCurrencyInput(e.target.value))}
          className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-brand-400 dark:bg-slate-800 dark:text-slate-100 ${
            error ? "border-red-400" : "border-slate-300 dark:border-slate-600"
          }`}
        />
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
