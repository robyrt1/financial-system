import { Target, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { Card } from "../../../components/ui/Card";

export interface Goal {
  id: string;
  title: string;
  icon?: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO date
  monthlySuggested?: number;
}

interface GoalCardProps {
  goal: Goal;
  onContribute: (id: string) => void;
  onEdit: (id: string) => void;
}

export function GoalCard({ goal, onContribute, onEdit }: GoalCardProps) {
  const percentage = Math.min(
    100,
    Math.max(0, (goal.currentAmount / goal.targetAmount) * 100),
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = () => {
    if (percentage >= 100) return "bg-emerald-500 shadow-emerald-500/50";
    if (percentage >= 80) return "bg-emerald-400 shadow-emerald-400/50";
    if (percentage >= 50) return "bg-cyan-500 shadow-cyan-500/50";
    return "bg-violet-500 shadow-violet-500/50";
  };

  const getTextColor = () => {
    if (percentage >= 100) return "text-emerald-500";
    if (percentage >= 80) return "text-emerald-400";
    if (percentage >= 50) return "text-cyan-500";
    return "text-violet-500";
  };

  const getBgColor = () => {
    if (percentage >= 100) return "bg-emerald-500/10 border-emerald-500/20";
    if (percentage >= 80) return "bg-emerald-400/10 border-emerald-400/20";
    if (percentage >= 50) return "bg-cyan-500/10 border-cyan-500/20";
    return "bg-violet-500/10 border-violet-500/20";
  };

  const calculateMonthsLeft = () => {
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const months =
      (deadline.getFullYear() - today.getFullYear()) * 12 +
      (deadline.getMonth() - today.getMonth());
    return Math.max(0, months);
  };

  const monthsLeft = calculateMonthsLeft();

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
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-content-title text-base leading-tight">
                {goal.title}
              </h3>
              <span className="text-xs text-content-muted">
                {goal.category}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-content-muted bg-navy-950/40 px-2 py-1 rounded-md border border-stroke/30">
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
            {monthsLeft > 0 ? (
              <span className="text-[10px] text-amber-400 font-medium">
                Faltam {monthsLeft} meses
              </span>
            ) : percentage < 100 ? (
              <span className="text-[10px] text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Prazo Esgotado
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-medium">
                Concluído
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
                Acumulado
              </span>
              <span className="font-mono text-xl font-bold text-content-title">
                {formatCurrency(goal.currentAmount)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block mb-1">
                Alvo
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

        {percentage < 100 &&
          goal.monthlySuggested !== undefined &&
          goal.monthlySuggested > 0 && (
            <div className="bg-navy-950/40 border border-stroke/40 rounded-lg p-2.5 mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-content-body">
                Aporte sugerido:{" "}
                <strong className="font-mono text-cyan-400">
                  {formatCurrency(goal.monthlySuggested)}
                </strong>{" "}
                / mês
              </span>
            </div>
          )}

        <div className="flex gap-2">
          <button
            onClick={() => onContribute(goal.id)}
            disabled={percentage >= 100}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-navy-950 font-bold text-xs py-2 rounded-lg transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            {percentage >= 100 ? "Meta Concluída" : "+ Aportar"}
          </button>
          <button
            onClick={() => onEdit(goal.id)}
            className="px-4 bg-surface-base hover:bg-surface-hover text-content-body hover:text-cyan-400 text-xs font-bold border border-stroke rounded-lg transition-all cursor-pointer"
          >
            Editar
          </button>
        </div>
      </Card.Content>
    </Card>
  );
}
