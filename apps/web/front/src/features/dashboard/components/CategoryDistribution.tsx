import {
  PieChart,
  ShieldAlert,
  Home,
  TrendingUp,
  Car,
  Shield,
  Plane,
  Heart,
  BookOpen,
  Briefcase,
  Coffee,
  HelpCircle,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";

export interface CategoryDistributionItem {
  categoryId: string;
  name: string;
  amount: string;
  percentage: number;
  colorClass?: string;
  bgClass?: string;
  iconName?: string;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  ShieldAlert,
  Home,
  TrendingUp,
  Car,
  Shield,
  Plane,
  Heart,
  BookOpen,
  Briefcase,
  Coffee,
  HelpCircle,
};
function CategorySkeleton() {
  return (
    <Card className="flex flex-col justify-between h-full animate-pulse p-5">
      <div>
        <Card.Header className="mb-4">
          <div className="h-5 bg-slate-300 dark:bg-navy-800 rounded w-1/2" />
          <div className="h-3 bg-slate-300 dark:bg-navy-800 rounded w-1/4 mt-2" />
        </Card.Header>
        <Card.Content className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-6 h-6 rounded bg-slate-200 dark:bg-navy-850" />
                  <div className="h-4 bg-slate-200 dark:bg-navy-850 rounded w-1/3" />
                </div>
                <div className="h-4 bg-slate-200 dark:bg-navy-850 rounded w-1/4" />
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-navy-850 rounded-full" />
            </div>
          ))}
        </Card.Content>
      </div>
    </Card>
  );
}

export function CategoryDistribution({
  data,
  loading,
}: {
  data?: CategoryDistributionItem[];
  loading?: boolean;
}) {
  if (loading || !data) {
    return <CategorySkeleton />;
  }

  if (data.length === 0) {
    return (
      <Card className="flex flex-col justify-between h-full p-5 min-h-[300px]">
        <Card.Header className="mb-4">
          <Card.Title className="flex items-center gap-2">
            <PieChart className="w-4.5 h-4.5 text-cyan-400" />
            <span>Distribuição por Categorias</span>
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex-grow flex items-center justify-center text-content-muted font-sans text-sm">
          Nenhuma transação categorizada este mês.
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        <Card.Header className="mb-4">
          <Card.Title className="flex items-center gap-2">
            <PieChart className="w-4.5 h-4.5 text-cyan-400" />
            <span>Distribuição por Categorias</span>
          </Card.Title>
          <span className="text-[12px] font-bold text-content-muted uppercase tracking-wider font-mono">
            Este Mês
          </span>
        </Card.Header>

        <Card.Content className="space-y-4.5">
          {data.map((cat, idx) => {
            const Icon = ICON_MAP[cat.iconName || "HelpCircle"] || HelpCircle;
            return (
              <div key={idx} className="space-y-1.5 group select-none">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-lg bg-surface-base border border-stroke flex items-center justify-center shrink-0 ${cat.colorClass || "text-cyan-400"}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-content-body group-hover:text-content-title transition-colors duration-200">
                      {cat.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-content-title mr-2">
                      {cat.amount}
                    </span>
                    <span className="font-mono text-[12px] text-content-muted">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Custom Composed Progress Bar */}
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${cat.bgClass || "bg-cyan-500"}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </Card.Content>
      </div>

      <div className="mt-4 pt-3.5 border-t border-stroke/70 flex items-center justify-between text-xs text-content-muted">
        <span>
          Limite consolidado: <strong>R$ 15.000,00</strong>
        </span>
        <span className="text-emerald-500 font-bold">
          R$ 5.849,80 restantes
        </span>
      </div>
    </Card>
  );
}
