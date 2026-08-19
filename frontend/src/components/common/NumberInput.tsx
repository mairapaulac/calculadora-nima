import { useEffect, useState } from "react";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  min?: number;
  max?: number;
  step?: number | "any";
  suffix?: string;
}

/** Input numerico simples (peso, horas, minutos), sem mascara monetaria. */
export function NumberInput({
  label,
  value,
  onChange,
  error,
  min = 0,
  max,
  step = 1,
  suffix,
}: NumberInputProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");
  const [text, setText] = useState(String(value));

  // Mantem o texto digitado como fonte da verdade da exibicao (evita reconstruir
  // "0" + digito -> "013"); so re-sincroniza quando o valor muda por fora do input.
  useEffect(() => {
    setText((current) => (Number(current) === value ? current : String(value)));
  }, [value]);

  function handleChange(raw: string) {
    setText(raw);
    const parsed = Number(raw);
    onChange(raw === "" || raw === "-" || !Number.isFinite(parsed) ? 0 : parsed);
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="number"
          value={text}
          min={min}
          max={max}
          step={step}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setText(String(value))}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-brand-400 dark:bg-slate-800 dark:text-slate-100 ${
            error ? "border-red-400" : "border-slate-300 dark:border-slate-600"
          }`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
