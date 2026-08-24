import { useState } from "react";
import { Target, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { KpiGrid } from "./KpiGrid";
import { SecurityCenter } from "./SecurityCenter";
import { CashFlowChart } from "./CashFlowChart";
import { CategoryDistribution } from "./CategoryDistribution";
import { TransactionsTable } from "./TransactionsTable";
import type { Transaction } from "./TransactionsTable";
import { SearchModal } from "./SearchModal";
import { NewTransactionModal } from "./NewTransactionModal";
import type { NewTransactionData } from "./NewTransactionModal";
import { Card } from "./Card";
import { SettingsTab } from "./SettingsTab";

export function DashboardScreen() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);

  // Initial dashboard mock transactions
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx-1",
      name: "Assinatura Cloud RMTECH",
      category: "Cybersecurity / Softwares",
      date: "2026-08-23",
      account: "Banco Principal",
      status: "confirmed",
      type: "expense",
      value: "R$ 1.840,00",
      secureSig: "SEC-SHA256-88AD",
    },
    {
      id: "tx-2",
      name: "Aluguel Escritório",
      category: "Moradia / Aluguel",
      date: "2026-08-20",
      account: "Banco Principal",
      status: "confirmed",
      type: "expense",
      value: "R$ 3.200,00",
      secureSig: "SEC-SHA256-45FE",
    },
    {
      id: "tx-3",
      name: "Dividendos Ações",
      category: "Investimentos",
      date: "2026-08-18",
      account: "Carteira Digital",
      status: "confirmed",
      type: "income",
      value: "R$ 2.300,00",
      secureSig: "SEC-SHA256-90A1",
    },
    {
      id: "tx-4",
      name: "Transferência Pendente",
      category: "Outros",
      date: "2026-08-15",
      account: "Banco Principal",
      status: "pending",
      type: "expense",
      value: "R$ 850,00",
      secureSig: "SEC-SHA256-PND1",
    },
    {
      id: "tx-5",
      name: "Tentativa de Acesso Não Autenticado",
      category: "Cibersegurança / Alerta",
      date: "2026-08-12",
      account: "Gateway Central",
      status: "blocked",
      type: "expense",
      value: "R$ 0,00",
      secureSig: "SEC-FAILED-AUTH",
    },
  ]);

  const handleAddTransaction = (newTx: NewTransactionData) => {
    const randomSig = `SEC-SHA256-${Math.random().toString(16).substr(2, 4).toUpperCase()}`;
    const today = new Date().toISOString().split("T")[0];

    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      name: newTx.name,
      category: newTx.category,
      date: today,
      account: newTx.account,
      status: "confirmed",
      type: newTx.type,
      value: `R$ ${newTx.value}`,
      secureSig: randomSig,
    };

    setTransactions((prev) => [tx, ...prev]);
  };

  // Mini Goals Component (Composed inline)
  const GoalsWidget = () => {
    const goals = [
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
            <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider font-mono">
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
          <button className="flex items-center gap-1 text-[10px] uppercase font-bold text-cyan-400 hover:text-cyan-500 tracking-wider cursor-pointer">
            <span>Gerenciar Metas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-surface-base text-content-body flex font-sans antialiased">
      {/* Composed Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container Wrapper */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? "pl-20" : "pl-64"
        }`}
      >
        {/* Composed Topbar */}
        <Topbar
          onSearchClick={() => setIsSearchOpen(true)}
          onNewTransactionClick={() => setIsNewTxOpen(true)}
          onSidebarToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Dynamic Content Body */}
        <main className="flex-1 p-6 space-y-6">
          {activeTab === "dashboard" && (
            <>
              {/* Row 1: KPI Dashboard Grid */}
              <KpiGrid />

              {/* Row 2: Charts and Cybersecurity Center */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <CashFlowChart />
                </div>
                <div className="lg:col-span-1">
                  <SecurityCenter />
                </div>
              </div>

              {/* Row 3: Categories, Goals, and Security Warnings */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <CategoryDistribution />
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
                      <p className="text-[10px] text-content-muted">
                        Para habilitar testes de invasão ou logs adicionais de
                        API, acesse a guia de configurações do console do
                        administrador.
                      </p>
                    </Card.Content>
                    <div className="pt-4 border-t border-amber-500/20 text-[10px] text-amber-500/80 font-mono">
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

          {activeTab === "settings" && <SettingsTab />}

          {activeTab !== "dashboard" && activeTab !== "settings" && (
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
        onSubmit={handleAddTransaction}
      />
    </div>
  );
}
