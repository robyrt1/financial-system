import {
  Target,
  TrendingUp,
  Calendar,
  AlertCircle,
  Award,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "../../../components/ui/Card";
import type { GoalItem } from "../api/goals.api";

interface GoalCardProps {
  goal: GoalItem;
  onContribute: (id: string) => void;
  onRedeem: (id: string) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({
  goal,
  onContribute,
  onRedeem,
  onDelete,
}: GoalCardProps) {
  const { t } = useTranslation();

  // Safe boundaries for percentage
  const percentage = Math.min(
    100,
    Math.max(
      0,
      goal.percentage || (goal.currentAmount / goal.targetAmount) * 100,
    ),
  );
  const isRedeemed = goal.status === "REDEEMED";
  const isCompleted = goal.status === "COMPLETED" || percentage >= 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = () => {
    if (isRedeemed) return "bg-slate-500 shadow-slate-500/50";
    if (isCompleted) return "bg-emerald-500 shadow-emerald-500/50";
    if (percentage >= 80) return "bg-emerald-400 shadow-emerald-400/50";
    if (percentage >= 50) return "bg-cyan-500 shadow-cyan-500/50";
    return "bg-violet-500 shadow-violet-500/50";
  };

  const getTextColor = () => {
    if (isRedeemed) return "text-slate-500";
    if (isCompleted) return "text-emerald-500";
    if (percentage >= 80) return "text-emerald-400";
    if (percentage >= 50) return "text-cyan-500";
    return "text-violet-500";
  };

  const getBgColor = () => {
    if (isRedeemed) return "bg-slate-500/10 border-slate-500/20";
    if (isCompleted)
      return "bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10 shadow-xl";
    if (percentage >= 80) return "bg-emerald-400/10 border-emerald-400/20";
    if (percentage >= 50) return "bg-cyan-500/10 border-cyan-500/20";
    return "bg-violet-50/10 border-violet-500/20";
  };

  const monthsLeft = goal.monthsRemaining || 0;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${getBgColor()}`}
    >
      <Card.Content className="p-5">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center bg-navy-900 border border-stroke/50 ${getTextColor()}`}
            >
              {isCompleted && !isRedeemed ? (
                <Award className="w-5 h-5" />
              ) : (
                <Target className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-content-title text-base leading-tight">
                {goal.name}
              </h3>
              <span className="text-xs text-content-muted">
                {goal.category}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-content-muted bg-navy-100 px-2 py-1 rounded-md border border-stroke/30">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(goal.deadline)
                  .toLocaleDateString("pt-BR", {
                    month: "short",
                    year: "numeric",
                  })
                  .toUpperCase()}
              </span>
            </div>
            {isRedeemed ? (
              <span className="text-[10px] text-slate-400 font-medium">
                {t("goals.filter_completed")} (Resgatada)
              </span>
            ) : monthsLeft > 0 ? (
              <span className="text-[10px] text-amber-400 font-medium">
                Faltam {monthsLeft} meses
              </span>
            ) : percentage < 100 ? (
              <span className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Prazo Esgotado
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-medium">
                {t("goals.filter_completed")}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
                {t("goals.card_current")}
              </span>
              <span
                className={`font-mono text-xl font-bold ${isRedeemed ? "text-slate-400" : "text-content-title"}`}
              >
                {formatCurrency(goal.currentAmount)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
                {t("goals.card_target")}
              </span>
              <span className="font-mono text-sm font-medium text-content-muted">
                {formatCurrency(goal.targetAmount)}
              </span>
            </div>
          </div>

          <div className="w-full bg-navy-950/60 rounded-full h-2.5 border border-stroke/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 shadow-lg ${getStatusColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold ${getTextColor()}`}>
              {percentage.toFixed(1)}% alcançado
            </span>
          </div>
        </div>

        {!isCompleted &&
          !isRedeemed &&
          goal.suggestedMonthlyDeposit !== undefined &&
          goal.suggestedMonthlyDeposit > 0 && (
            <div className="bg-navy-100 border border-stroke/40 rounded-lg p-2.5 mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-content-body">
                {t("goals.card_monthly")}:{" "}
                <strong className="font-mono text-cyan-400">
                  {formatCurrency(goal.suggestedMonthlyDeposit)}
                </strong>
              </span>
            </div>
          )}

        <div className="flex gap-2 mt-4">
          {!isCompleted && !isRedeemed && (
            <button
              onClick={() => onContribute(goal.id)}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold text-xs py-2 rounded-lg transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              + {t("goals.btn_contribute")}
            </button>
          )}

          {isCompleted && !isRedeemed && (
            <button
              onClick={() => onRedeem(goal.id)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-bold text-xs py-2 rounded-lg transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Award className="w-3.5 h-3.5 inline mr-1" />{" "}
              {t("goals.btn_redeem")}
            </button>
          )}

          <button
            onClick={() => onDelete(goal.id)}
            className="px-3 bg-surface-base hover:bg-red-500/10 text-content-muted hover:text-red-500 text-xs font-bold border border-stroke rounded-lg transition-all cursor-pointer"
            title={t("goals.btn_delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </Card.Content>
    </Card>
  );
}
