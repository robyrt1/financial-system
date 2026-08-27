import { useState, useEffect } from "react";
import { Plus, Settings2, ShieldCheck, RefreshCw } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { DebtCard } from "./DebtCard";
import type { Debt } from "./DebtCard";
import { SimulationPanel } from "./SimulationPanel";
import { NewDebtModal } from "./NewDebtModal";
import type { NewDebtData } from "./NewDebtModal";
import { PayInstallmentModal } from "./PayInstallmentModal";
import { AmortizeDebtModal } from "./AmortizeDebtModal";
import { api } from "../../../app/api";

interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface DebtsOverview {
  kpis: {
    totalRemainingPassives: number;
    totalMonthlyCost: number;
    projectedPayoffDate: string;
    weightedAverageInterestRate: number;
  };
  activeContracts: Debt[];
  paidOffContracts: Debt[];
}

export default function DebtsTab() {
  const [overview, setOverview] = useState<DebtsOverview | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payInstallmentDebt, setPayInstallmentDebt] = useState<Debt | null>(
    null,
  );
  const [amortizeDebt, setAmortizeDebt] = useState<Debt | null>(null);
  const [strategy, setStrategy] = useState<"AVALANCHE" | "SNOWBALL">(
    "AVALANCHE",
  );

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const [overviewRes, accountsRes] = await Promise.all([
        api.get<DebtsOverview>(`/debts/overview?strategy=${strategy}`),
        api.get<BankAccount[]>("/accounts"),
      ]);
      setOverview(overviewRes.data);
      setAccounts(accountsRes.data);
    } catch (err) {
      console.error("Failed to fetch debts overview or accounts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [strategy]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handlePayInstallment = async (id: string, sourceAccountId: string) => {
    try {
      // In a real scenario, sourceAccountId would be passed to generate a transaction
      await api.post(`/debts/${id}/pay-installment`, { sourceAccountId });
      fetchOverview();
    } catch (err) {
      console.error("Failed to pay installment", err);
    }
  };

  const handleAmortize = async (
    id: string,
    amount: number,
    sourceAccountId: string,
    reductionType: "TIME" | "PAYMENT",
  ) => {
    try {
      await api.post(`/debts/${id}/amortize`, {
        amount,
        sourceAccountId,
        reductionType,
      });
      fetchOverview();
    } catch (err) {
      console.error("Failed to amortize debt", err);
      alert("Erro ao amortizar dívida.");
    }
  };

  const handleCreateDebt = async (data: NewDebtData) => {
    try {
      await api.post("/debts", data);
      fetchOverview();
    } catch (err) {
      console.error("Failed to create debt", err);
      alert("Erro ao criar dívida.");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-fadeIn relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-content-title tracking-tight">
            Gestão de Dívidas & Amortização
          </h2>
          <p className="text-sm text-content-muted mt-1">
            Acompanhe seu passivo, projete quitações e planeje aportes
            extraordinários.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-surface-panel border border-stroke rounded-xl p-1 flex items-center text-xs font-bold">
            <button
              onClick={() => setStrategy("AVALANCHE")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none ${
                strategy === "AVALANCHE"
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-content-muted hover:text-content-body"
              }`}
            >
              Avalanche
            </button>
            <button
              onClick={() => setStrategy("SNOWBALL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none ${
                strategy === "SNOWBALL"
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-content-muted hover:text-content-body"
              }`}
            >
              Bola de Neve
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Dívida</span>
          </button>
        </div>
      </div>

      {/* Security Status Box */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-500" />
        <span className="text-xs font-semibold text-emerald-500/80 tracking-wide">
          Seus dados e históricos de financiamento estão 100% encriptados de
          ponta-a-ponta e vinculados à sua chave assimétrica.
        </span>
      </div>

      {loading && !overview ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      ) : (
        overview && (
          <>
            {/* KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-l-4 border-l-rose-500">
                <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
                  Passivo Total Restante
                </span>
                <span className="text-2xl font-bold font-mono text-content-title">
                  {formatCurrency(overview.kpis.totalRemainingPassives)}
                </span>
              </Card>
              <Card className="p-4 border-l-4 border-l-amber-500">
                <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
                  Custo Mensal das Parcelas
                </span>
                <span className="text-2xl font-bold font-mono text-content-title">
                  {formatCurrency(overview.kpis.totalMonthlyCost)}
                </span>
              </Card>
              <Card className="p-4 border-l-4 border-l-cyan-500">
                <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
                  Data Prevista de Quitação
                </span>
                <span className="text-2xl font-bold font-mono text-cyan-400">
                  {overview.kpis.totalRemainingPassives > 0
                    ? new Date(overview.kpis.projectedPayoffDate)
                        .toLocaleDateString("pt-BR", {
                          month: "short",
                          year: "numeric",
                        })
                        .toUpperCase()
                    : "QUITADO"}
                </span>
              </Card>
              <Card className="p-4 border-l-4 border-l-indigo-500">
                <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
                  Juros Médios Ponderados
                </span>
                <span className="text-2xl font-bold font-mono text-content-title">
                  {overview.kpis.weightedAverageInterestRate.toFixed(2)}%{" "}
                  <span className="text-sm font-sans font-normal text-content-muted text-transform-none lowercase">
                    a.m.
                  </span>
                </span>
              </Card>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Debts List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-bold text-content-title text-sm uppercase tracking-wider">
                    Contratos Ativos ({overview.activeContracts.length})
                  </h3>
                  <span className="text-xs text-content-muted flex items-center gap-1.5">
                    <Settings2 className="w-3.5 h-3.5" /> Ordenado por{" "}
                    {strategy === "AVALANCHE"
                      ? "maior taxa de juros"
                      : "menor saldo devedor"}
                  </span>
                </div>

                {loading && (
                  <div className="absolute inset-0 bg-navy-950/20 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-cyan-500 animate-spin" />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                  {overview.activeContracts.map((debt) => (
                    <DebtCard
                      key={debt.id}
                      debt={debt}
                      onPayInstallment={(id) =>
                        setPayInstallmentDebt(
                          overview.activeContracts.find((d) => d.id === id) ||
                            null,
                        )
                      }
                      onAmortize={(id) =>
                        setAmortizeDebt(
                          overview.activeContracts.find((d) => d.id === id) ||
                            null,
                        )
                      }
                    />
                  ))}
                </div>

                {overview.paidOffContracts.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold text-emerald-500 text-sm uppercase tracking-wider px-1 mb-4">
                      Histórico de Quitações
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70 hover:opacity-100 transition-opacity">
                      {overview.paidOffContracts.map((debt) => (
                        <DebtCard
                          key={debt.id}
                          debt={debt}
                          onPayInstallment={(id) =>
                            setPayInstallmentDebt(
                              overview.paidOffContracts.find(
                                (d) => d.id === id,
                              ) || null,
                            )
                          }
                          onAmortize={(id) =>
                            setAmortizeDebt(
                              overview.paidOffContracts.find(
                                (d) => d.id === id,
                              ) || null,
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Simulator */}
              <div className="lg:col-span-1 lg:sticky lg:top-6 h-[600px]">
                <SimulationPanel strategy={strategy} />
              </div>
            </div>
          </>
        )
      )}

      <NewDebtModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateDebt}
      />

      <PayInstallmentModal
        isOpen={!!payInstallmentDebt}
        onClose={() => setPayInstallmentDebt(null)}
        onSubmit={handlePayInstallment}
        debt={payInstallmentDebt}
        accounts={accounts}
      />

      <AmortizeDebtModal
        isOpen={!!amortizeDebt}
        onClose={() => setAmortizeDebt(null)}
        onSubmit={handleAmortize}
        debt={amortizeDebt}
        accounts={accounts}
      />
    </div>
  );
}
