import { PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Card({ title, subtitle, className, children }: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${
        className || ""
      }`}
    >
      {title && (
        <header className="mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
