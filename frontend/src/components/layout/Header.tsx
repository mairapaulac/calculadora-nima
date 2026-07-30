type Tab = "form" | "dashboard";

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        
        <div className="flex items-center gap-4">
          
          
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
            <img 
              src="/logo.svg" 
              alt="Logotipo NIMA" 
              className="h-14 w-14 object-contain transition-transform hover:scale-105" 
            />
          </div>

          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-50">
              NIMA
              <span className="ml-2 hidden font-normal text-slate-400 sm:inline-block">
                | Orçamento 3D
              </span>
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Calcule e emita orçamentos em segundos
            </p>
          </div>
        </div>

        <nav className="flex gap-2">
          <button
            type="button"
            onClick={() => onTabChange("form")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "form"
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Novo Orçamento
          </button>
          <button
            type="button"
            onClick={() => onTabChange("dashboard")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "dashboard"
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
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