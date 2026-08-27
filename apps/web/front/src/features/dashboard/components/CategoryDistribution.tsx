import { PieChart, ShieldAlert, Home, TrendingUp, Car } from "lucide-react";
import { Card } from "../../../components/ui/Card";

interface CategoryItem {
  name: string;
  amount: string;
  percentage: number;
  colorClass: string;
  bgClass: string;
  icon: React.ComponentType<any>;
}

export function CategoryDistribution() {
  const categories: CategoryItem[] = [
    {
      name: "Moradia / Aluguel",
      amount: "R$ 3.200,00",
      percentage: 35,
      colorClass: "text-indigo-500",
      bgClass: "bg-indigo-500",
      icon: Home,
    },
    {
      name: "Investimentos & Ações",
      amount: "R$ 2.300,00",
      percentage: 25,
      colorClass: "text-emerald-500",
      bgClass: "bg-emerald-500",
      icon: TrendingUp,
    },
    {
      name: "Licenças & Cybersecurity",
      amount: "R$ 1.840,00",
      percentage: 20,
      colorClass: "text-cyan-400",
      bgClass: "bg-cyan-400",
      icon: ShieldAlert,
    },
    {
      name: "Alimentação & Transporte",
      amount: "R$ 1.810,20",
      percentage: 20,
      colorClass: "text-amber-500",
      bgClass: "bg-amber-500",
      icon: Car,
    },
  ];

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
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="space-y-1.5 group select-none">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded-lg bg-surface-base border border-stroke flex items-center justify-center shrink-0 ${cat.colorClass}`}
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
                    className={`h-full transition-all duration-500 rounded-full ${cat.bgClass}`}
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
