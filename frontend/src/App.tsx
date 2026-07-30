import { useState } from "react";
import { Dashboard } from "./components/dashboard/Dashboard";
import { BudgetForm } from "./components/form/BudgetForm";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";

type Tab = "form" | "dashboard";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("form");
  const [dashboardRefreshToken, setDashboardRefreshToken] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {activeTab === "form" ? (
          <BudgetForm onBudgetCreated={() => setDashboardRefreshToken((t) => t + 1)} />
        ) : (
          <Dashboard refreshToken={dashboardRefreshToken} />
        )}
      </main>

      <Footer />
    </div>
  );
}
