interface ReadOnlyFieldProps {
  label: string;
  value: string;
  /** Texto curto explicando de onde vem o valor calculado. */
  hint?: string;
}

/**
 * Campo derivado de outros dados do formulario: exibe o valor calculado
 * com a mesma altura/estilo dos inputs, mas sem permitir edicao.
 */
export function ReadOnlyField({ label, value, hint }: ReadOnlyFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <output className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
        {value}
      </output>
      {hint && <span className="text-xs text-slate-400 dark:text-slate-500">{hint}</span>}
    </div>
  );
}
