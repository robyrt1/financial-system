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

export function KpiGrid() {
  const kpis: KpiItemProps[] = [
    {
      title: "Patrimônio Líquido",
      value: "R$ 142.384,50",
      change: "+4,2%",
      isPositive: true,
      type: "patrimony",
    },
    {
      title: "Receitas Totais",
      value: "R$ 18.420,00",
      change: "+12,4%",
      isPositive: true,
      type: "income",
    },
    {
      title: "Despesas Consolidadas",
      value: "R$ 9.150,20",
      change: "-2,1%",
      isPositive: true, // Decreasing expenses is positive
      type: "expense",
    },
    {
      title: "Dívidas & Obrigações",
      value: "R$ 3.840,10",
      change: "-15,4%",
      isPositive: true, // Decreasing debt is positive
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
