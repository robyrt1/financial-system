import { useState, useEffect } from "react";
import { Card } from "../../../components/ui/Card";
import { LineChart, ArrowDownRight, Clock, RefreshCw } from "lucide-react";
import { api } from "../../../app/api";

interface SimulationPanelProps {
  strategy: "AVALANCHE" | "SNOWBALL";
}

interface SimulationResult {
  savedInterest: number;
  reducedMonths: number;
  originalPayoffYears: number;
  newPayoffYears: number;
  newPayoffDate: string;
}

export function SimulationPanel({ strategy }: SimulationPanelProps) {
  const [extraPayment, setExtraPayment] = useState<number>(500);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSimulation = async () => {
      try {
        setLoading(true);
        const res = await api.post("/debts/simulate", {
          extraMonthlyAmount: extraPayment,
          strategy,
        });
        setResult(res.data);
      } catch (err) {
        console.error("Failed to fetch simulation", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchSimulation, 300); // debounce
    return () => clearTimeout(timeout);
  }, [extraPayment, strategy]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatMonthsToYears = (months: number) => {
    const years = Math.floor(months / 12);
    const m = months % 12;
    if (years === 0) return `${m} meses`;
    if (m === 0) return `${years} anos`;
    return `${years}a ${m}m`;
  };

  return (
    <Card className="h-full flex flex-col border-cyan-500/10 border-l border-t-0 border-r-0 border-b-0 lg:border-l-stroke lg:border-t lg:border-r lg:border-b lg:rounded-xl rounded-none relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <Card.Header className="pb-4">
        <Card.Title className="flex items-center justify-between text-cyan-400">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            <span>Simulador de Amortização</span>
          </div>
          {loading && (
            <RefreshCw className="w-4 h-4 text-cyan-500 animate-spin" />
          )}
        </Card.Title>
        <p className="text-[12px] text-content-muted mt-1 leading-relaxed">
          Descubra quanto tempo e dinheiro você economiza ao fazer pagamentos
          extras mensais.
        </p>
      </Card.Header>

      <Card.Content className="space-y-6 flex-1 flex flex-col">
        {/* Input Control */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[12px] font-bold uppercase tracking-wider text-content-body">
            <span>Aporte Extra Mensal</span>
            <span className="font-mono text-cyan-400">
              {formatCurrency(extraPayment)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5000"
            step="50"
            value={extraPayment}
            onChange={(e) => setExtraPayment(Number(e.target.value))}
            className="w-full h-2 bg-navy-600 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          />
          <div className="flex justify-between text-[9px] text-content-muted font-mono">
            <span>R$ 0</span>
            <span>R$ 5.000+</span>
          </div>
        </div>

        {/* Results Visualizer */}
        <div className="flex-1 space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex gap-4 transition-all">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70 block mb-0.5">
                Juros Economizados
              </span>
              <span className="text-xl font-mono font-bold text-emerald-400 block transition-all">
                {formatCurrency(result?.savedInterest || 0)}
              </span>
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex gap-4 transition-all">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500/70 block mb-0.5">
                Tempo Reduzido
              </span>
              <span className="text-xl font-mono font-bold text-cyan-400 block transition-all">
                - {formatMonthsToYears(result?.reducedMonths || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Projection Summary */}
        <div className="pt-4 border-t border-stroke/50 space-y-2">
          <div className="flex justify-between items-center text-[12px] text-content-muted">
            <span>Quitação Original:</span>
            <span className="font-mono">
              {result?.originalPayoffYears || 0} anos
            </span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-content-title">
            <span>Nova Quitação:</span>
            <span className="font-mono text-emerald-400">
              {result?.newPayoffYears || 0} anos
            </span>
          </div>
          <div className="flex justify-between items-center text-[12px] text-content-muted mt-2">
            <span>Nova Data Prevista:</span>
            <span className="font-mono">
              {result?.newPayoffDate
                ? new Date(result.newPayoffDate)
                    .toLocaleDateString("pt-BR", {
                      month: "short",
                      year: "numeric",
                    })
                    .toUpperCase()
                : "-"}
            </span>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}
