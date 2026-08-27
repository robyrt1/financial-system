import { useState, useMemo } from "react";
import { Plus, Settings2, Target, ShieldCheck } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { GoalCard } from "./GoalCard";
import type { Goal } from "./GoalCard";
import { NewGoalModal } from "./NewGoalModal";
import type { NewGoalData } from "./NewGoalModal";
import { ContributeModal } from "./ContributeModal";

export default function GoalsTab() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">(
    "ALL",
  );

  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "goal-1",
      title: "Reserva de Emergência",
      category: "Reserva",
      targetAmount: 50000,
      currentAmount: 42000,
      deadline: "2027-01-01T00:00:00.000Z",
      monthlySuggested: 2000,
    },
    {
      id: "goal-2",
      title: "Viagem Europa",
      category: "Viagem",
      targetAmount: 25000,
      currentAmount: 8500,
      deadline: "2026-12-15T00:00:00.000Z",
      monthlySuggested: 4125,
    },
    {
      id: "goal-3",
      title: "Carro Novo",
      category: "Aquisição",
      targetAmount: 80000,
      currentAmount: 80000,
      deadline: "2026-08-01T00:00:00.000Z",
      monthlySuggested: 0,
    },
    {
      id: "goal-4",
      title: "Investimento Longo Prazo",
      category: "Investimentos",
      targetAmount: 500000,
      currentAmount: 150000,
      deadline: "2035-12-31T00:00:00.000Z",
      monthlySuggested: 3000,
    },
  ]);

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      const isCompleted = g.currentAmount >= g.targetAmount;
      if (filter === "COMPLETED") return isCompleted;
      if (filter === "IN_PROGRESS") return !isCompleted;
      return true;
    });
  }, [goals, filter]);

  const kpis = useMemo(() => {
    let totalAcumulado = 0;
    let metaTotal = 0;
    let aporteMensal = 0;

    goals.forEach((g) => {
      totalAcumulado += g.currentAmount;
      metaTotal += g.targetAmount;
      if (g.currentAmount < g.targetAmount && g.monthlySuggested) {
        aporteMensal += g.monthlySuggested;
      }
    });

    return { totalAcumulado, metaTotal, aporteMensal };
  }, [goals]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleCreateGoal = (data: NewGoalData) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: data.title,
      category: data.category,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      deadline: new Date(data.deadline).toISOString(),
      monthlySuggested: (data.targetAmount - data.currentAmount) / 12, // Simple projection
    };
    setGoals((prev) => [newGoal, ...prev]);
  };

  const handleContribute = (
    goalId: string,
    amount: number,
    _account: string,
  ) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return {
            ...g,
            currentAmount: Math.min(g.targetAmount, g.currentAmount + amount),
          };
        }
        return g;
      }),
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-fadeIn relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-content-title tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            Metas Financeiras
          </h2>
          <p className="text-sm text-content-muted mt-1">
            Planejamento de objetivos, reservas e evolução de patrimônio.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-surface-panel border border-stroke rounded-xl p-1 flex items-center text-xs font-bold">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none ${filter === "ALL" ? "bg-cyan-500/10 text-cyan-400" : "text-content-muted hover:text-content-body"}`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter("IN_PROGRESS")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none ${filter === "IN_PROGRESS" ? "bg-cyan-500/10 text-cyan-400" : "text-content-muted hover:text-content-body"}`}
            >
              Em Andamento
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none ${filter === "COMPLETED" ? "bg-cyan-500/10 text-cyan-400" : "text-content-muted hover:text-content-body"}`}
            >
              Concluídas
            </button>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Meta</span>
          </button>
        </div>
      </div>

      {/* Security Status Box */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-500" />
        <span className="text-xs font-semibold text-emerald-500/80 tracking-wide">
          Objetivos segregados em vaults encriptados. Seus saldos estão
          sincronizados com as contas vinculadas via Zero-Knowledge Proofs.
        </span>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-cyan-500">
          <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
            Total Acumulado
          </span>
          <span className="text-2xl font-bold font-mono text-content-title">
            {formatCurrency(kpis.totalAcumulado)}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-indigo-500">
          <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
            Meta Total Alvo
          </span>
          <span className="text-2xl font-bold font-mono text-content-title">
            {formatCurrency(kpis.metaTotal)}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
            Aporte Mensal Necessário Médio
          </span>
          <span className="text-2xl font-bold font-mono text-content-title">
            {formatCurrency(kpis.aporteMensal)}
          </span>
        </Card>
      </div>

      {/* Main Layout Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-content-title text-sm uppercase tracking-wider">
            Seus Objetivos ({filteredGoals.length})
          </h3>
          <span className="text-xs text-content-muted flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5" /> Ordenado por Prazo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onContribute={(id) =>
                setContributeGoal(goals.find((g) => g.id === id) || null)
              }
              onEdit={() => alert("Editar Meta não implementado neste MVP.")}
            />
          ))}
          {filteredGoals.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center">
              <Target className="w-12 h-12 text-stroke mb-4" />
              <p className="text-content-muted font-bold text-lg">
                Nenhuma meta encontrada.
              </p>
              <p className="text-content-muted/70 text-sm mt-1">
                Crie um novo objetivo para começar a planejar seu futuro.
              </p>
            </div>
          )}
        </div>
      </div>

      <NewGoalModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateGoal}
      />

      <ContributeModal
        isOpen={!!contributeGoal}
        goal={contributeGoal}
        onClose={() => setContributeGoal(null)}
        onSubmit={handleContribute}
      />
    </div>
  );
}
