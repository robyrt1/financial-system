import {
  TrendingUp,
  TrendingDown,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";

interface KpiItemProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  type: "patrimony" | "income" | "expense" | "debt";
}

function KpiCard({ title, value, change, isPositive, type }: KpiItemProps) {
  const getIcon = () => {
    switch (type) {
      case "patrimony":
        return <Landmark className="w-5 h-5 text-cyan-400" />;
      case "income":
        return <ArrowUpRight className="w-5 h-5 text-emerald-500" />;
      case "expense":
        return <ArrowDownRight className="w-5 h-5 text-rose-500" />;
      case "debt":
        return <TrendingDown className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <Card className="relative overflow-hidden group">
      {/* Background Cyber Glow Decorator */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-400/10 transition-all duration-500" />

      <Card.Header className="mb-2">
        <Card.Title>{title}</Card.Title>
        <div className="w-9 h-9 rounded-xl bg-surface-base border border-stroke flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
      </Card.Header>

      <Card.Content>
        <div className="flex flex-col gap-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight text-content-title">
            {value}
          </span>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`flex items-center gap-0.5 font-bold ${
                isPositive ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              {change}
            </span>
            <span className="text-content-muted">vs mês passado</span>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

function KpiSkeleton() {
  return (
    <Card className="relative overflow-hidden animate-pulse">
      <Card.Header className="mb-2">
        <div className="h-4 bg-slate-300 dark:bg-navy-800 rounded w-2/3" />
        <div className="w-9 h-9 rounded-xl bg-slate-300 dark:bg-navy-800 shrink-0" />
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="h-8 bg-slate-300 dark:bg-navy-800 rounded w-1/2" />
          <div className="h-3 bg-slate-300 dark:bg-navy-800 rounded w-1/3 mt-1.5" />
        </div>
      </Card.Content>
    </Card>
  );
}

export interface KpiData {
  patrimony: number;
  totalIncomes: number;
  totalExpenses: number;
  totalDebts: number;
}

export function KpiGrid({
  data,
  loading,
}: {
  data?: KpiData;
  loading?: boolean;
}) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <KpiSkeleton key={idx} />
        ))}
      </div>
    );
  }

  const kpis: KpiItemProps[] = [
    {
      title: "Patrimônio Líquido",
      value: formatCurrency(data.patrimony),
      change: "+0,0%",
      isPositive: true,
      type: "patrimony",
    },
    {
      title: "Receitas Totais",
      value: formatCurrency(data.totalIncomes),
      change: "+0,0%",
      isPositive: true,
      type: "income",
    },
    {
      title: "Despesas Consolidadas",
      value: formatCurrency(data.totalExpenses),
      change: "-0,0%",
      isPositive: true,
      type: "expense",
    },
    {
      title: "Dívidas & Obrigações",
      value: formatCurrency(data.totalDebts),
      change: "-0,0%",
      isPositive: true,
      type: "debt",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {kpis.map((kpi, idx) => (
        <KpiCard key={idx} {...kpi} />
      ))}
    </div>
  );
}
