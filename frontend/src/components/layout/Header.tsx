type Tab = "form" | "dashboard";

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            NIMA — Orçamento de Manufatura Aditiva
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Calcule e emita orçamentos de impressão 3D em segundos
          </p>
        </div>
        <nav className="flex gap-2">
          <button
            type="button"
            onClick={() => onTabChange("form")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "form"
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Novo Orçamento
          </button>
          <button
            type="button"
            onClick={() => onTabChange("dashboard")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === "dashboard"
                ? "bg-brand-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Dashboard
          </button>
        </nav>
      </div>
    </header>
  );
}
