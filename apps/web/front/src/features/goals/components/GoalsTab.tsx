import { useState, useEffect } from "react";
import { Plus, Settings2, Target, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "../../../components/ui/Card";
import { api } from "../../../app/api";

import { GoalCard } from "./GoalCard";
import { NewGoalModal } from "./NewGoalModal";
import { ContributeModal } from "./ContributeModal";
import { RedeemGoalModal } from "./RedeemGoalModal";
import { DeleteGoalModal } from "./DeleteGoalModal";

import {
  useGoalsOverview,
  useCreateGoal,
  useDepositGoal,
  useRedeemGoal,
  useDeleteGoal,
} from "../hooks/useGoals";
import type { GoalItem } from "../api/goals.api";

interface Account {
  id: string;
  name: string;
  balance: number;
}

export default function GoalsTab() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">(
    "ALL",
  );

  // Local States for Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<GoalItem | null>(null);
  const [modalType, setModalType] = useState<
    "contribute" | "redeem" | "delete" | null
  >(null);

  // External Data
  const [accounts, setAccounts] = useState<Account[]>([]);

  // React Query Hooks
  const { data: overview, isLoading: isGoalsLoading } = useGoalsOverview(
    filter === "ALL" ? undefined : filter,
  );
  const createMutation = useCreateGoal();
  const depositMutation = useDepositGoal();
  const redeemMutation = useRedeemGoal();
  const deleteMutation = useDeleteGoal();

  // Load Accounts for Modals
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get<Account[]>("/accounts");
        setAccounts(res.data);
      } catch (err) {
        console.error("Failed to load accounts for goals:", err);
      }
    };
    fetchAccounts();
  }, []);

  const goalsList = overview?.goals || [];
  const kpis = overview?.kpis || {
    totalAccumulated: 0,
    totalTarget: 0,
    averageRequiredMonthlyDeposit: 0,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Handlers
  const openModal = (type: "contribute" | "redeem" | "delete", id: string) => {
    const goal = goalsList.find((g) => g.id === id);
    if (goal) {
      setActiveGoal(goal);
      setModalType(type);
    }
  };

  const closeModal = () => {
    setActiveGoal(null);
    setModalType(null);
  };

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsNewModalOpen(false);
  };

  const handleContribute = async (
    goalId: string,
    amount: number,
    accountId: string,
  ) => {
    await depositMutation.mutateAsync({
      id: goalId,
      data: { amount, sourceAccountId: accountId },
    });
    closeModal();
  };

  const handleRedeem = async (goalId: string, accountId: string) => {
    await redeemMutation.mutateAsync({
      id: goalId,
      data: { destinationAccountId: accountId },
    });
    closeModal();
  };

  const handleDelete = async (goalId: string, refundAccountId?: string) => {
    await deleteMutation.mutateAsync({
      id: goalId,
      data: refundAccountId ? { refundAccountId } : undefined,
    });
    closeModal();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto animate-fadeIn relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-content-title tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            {t("goals.title")}
          </h2>
          <p className="text-sm text-content-muted mt-1">
            {t("goals.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-surface-panel border border-stroke rounded-xl p-1 flex items-center text-xs font-bold">
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none ${filter === "ALL" ? "bg-cyan-500/10 text-cyan-400" : "text-content-muted hover:text-content-body"}`}
            >
              {t("goals.filter_all")}
            </button>
            <button
              onClick={() => setFilter("IN_PROGRESS")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none ${filter === "IN_PROGRESS" ? "bg-cyan-500/10 text-cyan-400" : "text-content-muted hover:text-content-body"}`}
            >
              {t("goals.filter_in_progress")}
            </button>
            <button
              onClick={() => setFilter("COMPLETED")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer focus:outline-none ${filter === "COMPLETED" ? "bg-cyan-500/10 text-cyan-400" : "text-content-muted hover:text-content-body"}`}
            >
              {t("goals.filter_completed")}
            </button>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t("goals.btn_new_goal")}</span>
          </button>
        </div>
      </div>

      {/* Security Status Box */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-500" />
        <span className="text-xs font-semibold text-emerald-500/80 tracking-wide">
          {t("goals.security_notice")}
        </span>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-cyan-500">
          <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
            {t("goals.kpi_total_accumulated")}
          </span>
          <span className="text-2xl font-bold font-mono text-content-title">
            {isGoalsLoading ? "---" : formatCurrency(kpis.totalAccumulated)}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-indigo-500">
          <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
            {t("goals.kpi_total_target")}
          </span>
          <span className="text-2xl font-bold font-mono text-content-title">
            {isGoalsLoading ? "---" : formatCurrency(kpis.totalTarget)}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
            {t("goals.kpi_monthly_avg")}
          </span>
          <span className="text-2xl font-bold font-mono text-content-title">
            {isGoalsLoading
              ? "---"
              : formatCurrency(kpis.averageRequiredMonthlyDeposit)}
          </span>
        </Card>
      </div>

      {/* Main Layout Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-content-title text-sm uppercase tracking-wider">
            {t("goals.your_objectives")} ({goalsList.length})
          </h3>
          <span className="text-xs text-content-muted flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5" />{" "}
            {t("goals.sorted_by_deadline")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isGoalsLoading ? (
            <div className="col-span-full py-10 flex justify-center text-cyan-400">
              <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          ) : (
            goalsList.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onContribute={(id) => openModal("contribute", id)}
                onRedeem={(id) => openModal("redeem", id)}
                onDelete={(id) => openModal("delete", id)}
              />
            ))
          )}
          {!isGoalsLoading && goalsList.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center">
              <Target className="w-12 h-12 text-stroke mb-4" />
              <p className="text-content-muted font-bold text-lg">
                {t("goals.no_goals_found")}
              </p>
              <p className="text-content-muted/70 text-sm mt-1">
                {t("goals.no_goals_desc")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <NewGoalModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

      <ContributeModal
        isOpen={modalType === "contribute"}
        goal={activeGoal}
        accounts={accounts}
        onClose={closeModal}
        onSubmit={handleContribute}
        isPending={depositMutation.isPending}
      />

      <RedeemGoalModal
        isOpen={modalType === "redeem"}
        goal={activeGoal}
        accounts={accounts}
        onClose={closeModal}
        onSubmit={handleRedeem}
        isPending={redeemMutation.isPending}
      />

      <DeleteGoalModal
        isOpen={modalType === "delete"}
        goal={activeGoal}
        accounts={accounts}
        onClose={closeModal}
        onSubmit={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
