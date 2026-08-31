import { useState, useEffect } from "react";
import { Target, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { KpiGrid } from "./KpiGrid";
import { SecurityCenter } from "./SecurityCenter";
import { CashFlowChart } from "./CashFlowChart";
import { CategoryDistribution } from "./CategoryDistribution";
import { TransactionsTable } from "../../transactions/components/TransactionsTable";
import type { Transaction } from "../../transactions/components/TransactionsTable";
import { SearchModal } from "./SearchModal";
import { NewTransactionModal } from "../../transactions/components/NewTransactionModal";
import { Card } from "../../../components/ui/Card";
import { SettingsTab } from "./SettingsTab";
import AccountsTab from "./AccountsTab";
import TransactionsTab from "../../transactions/components/TransactionsTab";
import CategoriesTab from "../../categories/components/CategoriesTab";
import GoalsTab from "../../goals/components/GoalsTab";
import { useNavigate } from "react-router-dom";
import { api, setAccessToken } from "../../../app/api";
import DebtsTab from "../../debts/components/DebtsTab";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { useGoalsOverview } from "../../goals/hooks/useGoals";

interface DashboardScreenProps {
  initialTab?: string;
}

export function DashboardScreen({
  initialTab = "dashboard",
}: DashboardScreenProps) {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("@financial:refresh_token");
      setAccessToken(null);
      navigate("/");
    }
  };
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    metrics,
    loading: metricsLoading,
    refetch: refetchMetrics,
  } = useDashboardMetrics();
  const { data: goalsData } = useGoalsOverview();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [rawTransactions, setRawTransactions] = useState<any[]>([]);

  const fetchLookupData = async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        api.get("/accounts"),
        api.get("/categories"),
      ]);
      setAccounts(accRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Failed to fetch lookup data", err);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const res = await api.get("/transactions?limit=5");
      setRawTransactions(res.data.data);
    } catch (err) {
      console.error("Failed to fetch recent transactions", err);
    }
  };

  useEffect(() => {
    fetchLookupData();
    fetchRecentTransactions();
  }, []);

  const transactions: Transaction[] = rawTransactions.map((tx) => {
    const accountName =
      accounts.find((a) => a.id === tx.accountId)?.name || "Desconhecido";
    const categoryName =
      tx.category?.name ||
      categories.find((c) => c.id === tx.categoryId)?.name ||
      "Geral";
    const subcategoryName = tx.subcategory?.name || null;
    return {
      id: tx.id,
      name: tx.description,
      category: categoryName,
      subcategory: subcategoryName,
      date: tx.date,
      account: accountName,
      status:
        tx.status === "SETTLED"
          ? "confirmed"
          : tx.status === "PENDING"
            ? "pending"
            : "blocked",
      type: tx.type.toLowerCase() as "income" | "expense",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(tx.amount),
      secureSig: `SEC-SHA256-${tx.id.substring(0, 4).toUpperCase()}`,
    };
  });

  // Mini Goals Component (Composed inline)
  const GoalsWidget = () => {
    const formatCurrency = (val: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(val);
    };

    const hasRealGoals =
      goalsData && goalsData.goals && goalsData.goals.length > 0;
    const goals = hasRealGoals
      ? goalsData.goals.slice(0, 3).map((g: any) => ({
          title: g.name,
          target: formatCurrency(g.targetAmount),
          current: formatCurrency(g.currentAmount),
          progress: Math.round(g.percentage),
          color: g.color || "bg-cyan-400",
        }))
      : [
          {
            title: "Reserva de Emergência",
            target: "R$ 50.000,00",
            current: "R$ 42.000,00",
            progress: 84,
            color: "bg-emerald-500",
          },
          {
            title: "Upgrade de Servidores",
            target: "R$ 15.000,00",
            current: "R$ 9.000,00",
            progress: 60,
            color: "bg-cyan-400",
          },
          {
            title: "Meta de Investimentos",
            target: "R$ 100.000,00",
            current: "R$ 75.000,00",
            progress: 75,
            color: "bg-indigo-500",
          },
        ];

    return (
      <Card className="h-full flex flex-col justify-between">
        <div>
          <Card.Header className="mb-4">
            <Card.Title className="flex items-center gap-2">
              <Target className="w-4.5 h-4.5 text-cyan-400" />
              <span>Metas Financeiras</span>
            </Card.Title>
            <span className="text-[12px] font-bold text-content-muted uppercase tracking-wider font-mono">
              Q3 2026
            </span>
          </Card.Header>

          <Card.Content className="space-y-4">
            {goals.map((goal, idx) => (
              <div key={idx} className="space-y-1.5 select-none">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-content-body">
                    {goal.title}
                  </span>
                  <span className="font-mono font-bold text-content-title">
                    {goal.progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${goal.color}`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] text-content-muted font-mono">
                  <span>Atual: {goal.current}</span>
                  <span>Alvo: {goal.target}</span>
                </div>
              </div>
            ))}
          </Card.Content>
        </div>

        <div className="mt-4 pt-3 flex justify-end">
          <button className="flex items-center gap-1 text-[12px] uppercase font-bold text-cyan-400 hover:text-cyan-500 tracking-wider cursor-pointer">
            <span>Gerenciar Metas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Card>
    );
  };

  const PALETTE = [
    { text: "text-indigo-500", bg: "bg-indigo-500" },
    { text: "text-emerald-500", bg: "bg-emerald-500" },
    { text: "text-cyan-400", bg: "bg-cyan-400" },
    { text: "text-amber-500", bg: "bg-amber-500" },
    { text: "text-rose-500", bg: "bg-rose-500" },
  ];

  const mappedCategoryDistribution = metrics?.categoryDistribution.map(
    (cat, idx) => {
      const categoryObj = categories.find((c) => c.id === cat.categoryId);
      const color = PALETTE[idx % PALETTE.length];
      return {
        categoryId: cat.categoryId,
        name: categoryObj?.name || cat.name,
        amount: new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(cat.amount),
        percentage: cat.percentage,
        colorClass: color.text,
        bgClass: color.bg,
        iconName: categoryObj?.iconName || "HelpCircle",
      };
    },
  );

  return (
    <div className="min-h-screen w-full bg-surface-base text-content-body flex font-sans antialiased overflow-x-hidden">
      {/* Composed Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileSidebarOpen(false);
          if (tab === "dashboard") navigate("/dashboard");
          else if (tab === "accounts") navigate("/accounts");
          else if (tab === "transactions") navigate("/transactions");
          else if (tab === "categories") navigate("/categories");
          else if (tab === "debts") navigate("/debts");
          else if (tab === "goals") navigate("/goals");
        }}
        onLogout={handleLogout}
      />

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
        />
      )}

      {/* Main Container Wrapper */}
      <div
        className={`flex-1 flex flex-col min-h-screen w-full min-w-0 transition-all duration-300 pl-0 ${
          isSidebarCollapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        {/* Composed Topbar */}
        <Topbar
          onSearchClick={() => setIsSearchOpen(true)}
          onNewTransactionClick={() => setIsNewTxOpen(true)}
          onSidebarToggle={() => {
            if (window.innerWidth < 768) {
              setIsMobileSidebarOpen(!isMobileSidebarOpen);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
        />

        {/* Dynamic Content Body */}
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 space-y-4 sm:space-y-6">
          {activeTab === "dashboard" && (
            <>
              {/* Row 1: KPI Dashboard Grid */}
              <KpiGrid data={metrics?.kpis} loading={metricsLoading} />

              {/* Row 2: Charts and Cybersecurity Center */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 min-w-0">
                  <CashFlowChart
                    chartData={metrics?.cashFlow}
                    loading={metricsLoading}
                  />
                </div>
                <div className="lg:col-span-1 min-w-0">
                  <SecurityCenter />
                </div>
              </div>

              {/* Row 3: Categories, Goals, and Security Warnings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-1 min-w-0">
                  <CategoryDistribution
                    data={mappedCategoryDistribution}
                    loading={metricsLoading}
                  />
                </div>
                <div className="lg:col-span-1">
                  <GoalsWidget />
                </div>
                <div className="lg:col-span-1 flex flex-col gap-6">
                  {/* Realtime Cyber Warnings Panel */}
                  <Card className="bg-amber-500/5 border border-amber-500/25 p-5 flex flex-col justify-between flex-1">
                    <Card.Header className="mb-2">
                      <Card.Title className="flex items-center gap-2 text-amber-500">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <span>Security Auditing Mode</span>
                      </Card.Title>
                    </Card.Header>
                    <Card.Content className="text-xs text-content-body leading-relaxed space-y-2">
                      <p>
                        RMTECH utiliza{" "}
                        <strong>
                          verificação criptográfica de integridade de
                          ponta-a-ponta
                        </strong>
                        . Nenhuma transação pode ser confirmada sem que a
                        assinatura de chave pública e o hash correspondam aos
                        metadados do remetente.
                      </p>
                      <p className="text-[12px] text-content-muted">
                        Para habilitar testes de invasão ou logs adicionais de
                        API, acesse a guia de configurações do console do
                        administrador.
                      </p>
                    </Card.Content>
                    <div className="pt-4 border-t border-amber-500/20 text-[12px] text-amber-500/80 font-mono">
                      Security Level:{" "}
                      <strong>ENCRYPTED & HIGH-VERIFICATION</strong>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Row 4: Latest Transactions table */}
              <Card>
                <Card.Header className="mb-3.5">
                  <div>
                    <Card.Title>Últimas Transações Registradas</Card.Title>
                    <p className="text-xs text-content-muted mt-1">
                      Transações mais recentes monitoradas e validadas
                      criptograficamente.
                    </p>
                  </div>
                </Card.Header>
                <Card.Content>
                  <TransactionsTable transactions={transactions} />
                </Card.Content>
              </Card>
            </>
          )}

          {activeTab === "accounts" && <AccountsTab />}
          {activeTab === "transactions" && <TransactionsTab />}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "debts" && <DebtsTab />}
          {activeTab === "goals" && <GoalsTab />}
          {activeTab === "settings" && <SettingsTab />}

          {activeTab !== "dashboard" &&
            activeTab !== "settings" &&
            activeTab !== "accounts" &&
            activeTab !== "transactions" &&
            activeTab !== "categories" &&
            activeTab !== "debts" &&
            activeTab !== "goals" && (
              // Fallback content when other navigation tabs are selected
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-content-title uppercase tracking-wide">
                    Área Restrita
                  </h3>
                  <p className="text-sm text-content-muted max-w-sm mt-1">
                    A visualização da guia "{activeTab}" está desativada no modo
                    de demonstração.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="px-4 py-2 bg-surface-card border border-stroke hover:border-cyan-400 text-content-body hover:text-cyan-400 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Voltar ao Dashboard Principal
                </button>
              </div>
            )}
        </main>
      </div>

      {/* Interactive Command Search Modal (Cmd+K) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigateTab={setActiveTab}
        onNewTransaction={() => setIsNewTxOpen(true)}
      />

      {/* Interactive New Transaction Creator Modal */}
      <NewTransactionModal
        isOpen={isNewTxOpen}
        onClose={() => setIsNewTxOpen(false)}
        onSuccess={() => {
          fetchRecentTransactions();
          refetchMetrics();
        }}
      />
    </div>
  );
}
