import { useState } from "react";
import { AreaChart, TrendingUp } from "lucide-react";
import { Card } from "../../../components/ui/Card";

interface DataPoint {
  month: string;
  income: number;
  expense: number;
}

function ChartSkeleton() {
  return (
    <Card className="flex flex-col justify-between h-full animate-pulse p-6">
      <div className="h-6 bg-slate-300 dark:bg-navy-800 rounded w-1/3 mb-4" />
      <div className="flex-grow flex items-end gap-4 h-[160px] border-b border-l border-stroke/20 pb-2 pl-2 mt-4">
        <div className="flex-1 bg-slate-200 dark:bg-navy-800/40 rounded-t h-1/3" />
        <div className="flex-1 bg-slate-200 dark:bg-navy-800/40 rounded-t h-1/2" />
        <div className="flex-1 bg-slate-200 dark:bg-navy-800/40 rounded-t h-2/3" />
        <div className="flex-1 bg-slate-200 dark:bg-navy-800/40 rounded-t h-1/3" />
        <div className="flex-1 bg-slate-200 dark:bg-navy-800/40 rounded-t h-4/5" />
        <div className="flex-1 bg-slate-200 dark:bg-navy-800/40 rounded-t h-3/5" />
      </div>
      <div className="h-4 bg-slate-300 dark:bg-navy-800 rounded w-1/4 mt-4" />
    </Card>
  );
}

export function CashFlowChart({
  chartData,
  loading,
}: {
  chartData?: DataPoint[];
  loading?: boolean;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (loading || !chartData) {
    return <ChartSkeleton />;
  }

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col justify-between h-full p-6 min-h-[300px]">
        <Card.Header className="mb-4">
          <Card.Title className="flex items-center gap-2">
            <AreaChart className="w-4.5 h-4.5 text-cyan-400" />
            <span>Fluxo de Caixa Mensal</span>
          </Card.Title>
        </Card.Header>
        <Card.Content className="flex-grow flex items-center justify-center text-content-muted font-sans text-sm">
          Nenhum dado de fluxo de caixa disponível.
        </Card.Content>
      </Card>
    );
  }

  let data = chartData;
  if (data.length === 1) {
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    const currentMonthIdx = months.indexOf(data[0].month);
    const prevMonthName =
      currentMonthIdx > 0 ? months[currentMonthIdx - 1] : "Ant";
    data = [{ month: prevMonthName, income: 0, expense: 0 }, data[0]];
  }

  // SVG Chart Dimensions
  const width = 500;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal =
    Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1000) * 1.1;

  // Helpers to get X/Y coords
  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (value: number) => {
    return paddingTop + chartHeight - (value / maxVal) * chartHeight;
  };

  // Generate path points
  const incomePoints = data
    .map((d, i) => `${getX(i)},${getY(d.income)}`)
    .join(" ");
  const expensePoints = data
    .map((d, i) => `${getX(i)},${getY(d.expense)}`)
    .join(" ");

  // Area paths (closing path at bottom y)
  const incomeArea = `${getX(0)},${getY(0)} ${incomePoints} ${getX(data.length - 1)},${getY(0)}`;
  const expenseArea = `${getX(0)},${getY(0)} ${expensePoints} ${getX(data.length - 1)},${getY(0)}`;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        <Card.Header className="mb-4">
          <Card.Title className="flex items-center gap-2">
            <AreaChart className="w-4.5 h-4.5 text-cyan-400" />
            <span>Fluxo de Caixa Mensal</span>
          </Card.Title>
          <div className="flex gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 block" />
              <span className="text-content-body">Receitas</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 block" />
              <span className="text-content-body">Despesas</span>
            </span>
          </div>
        </Card.Header>

        <Card.Content className="relative">
          {/* Responsive SVG Chart */}
          <div className="w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full overflow-visible"
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Gradients */}
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 5000, 10000, 15000, 20000].map((gridVal) => {
                const y = getY(gridVal);
                return (
                  <g key={gridVal}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="currentColor"
                      className="text-stroke/30"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[9px] font-mono fill-content-muted"
                    >
                      {gridVal / 1000}k
                    </text>
                  </g>
                );
              })}

              {/* Filled Areas */}
              <polygon points={incomeArea} fill="url(#incomeGrad)" />
              <polygon points={expenseArea} fill="url(#expenseGrad)" />

              {/* Lines */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                points={incomePoints}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                points={expensePoints}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Hover Cursor Vertical Line */}
              {hoveredIdx !== null && (
                <line
                  x1={getX(hoveredIdx)}
                  y1={paddingTop}
                  x2={getX(hoveredIdx)}
                  y2={height - paddingBottom}
                  stroke="rgba(0, 209, 255, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  className="pointer-events-none"
                />
              )}

              {/* Coords & Hitboxes */}
              {data.map((d, i) => {
                const cx = getX(i);
                const cyIncome = getY(d.income);
                const cyExpense = getY(d.expense);

                return (
                  <g key={i}>
                    {/* Circle Dots on Lines */}
                    {hoveredIdx === i && (
                      <>
                        <circle cx={cx} cy={cyIncome} r="4" fill="#10b981" />
                        <circle cx={cx} cy={cyExpense} r="4" fill="#f43f5e" />
                      </>
                    )}

                    {/* Hitboxes for Hover */}
                    <rect
                      x={cx - chartWidth / (data.length - 1) / 2}
                      y={paddingTop}
                      width={chartWidth / (data.length - 1)}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(i)}
                    />
                  </g>
                );
              })}

              {/* X Axis labels */}
              {data.map((d, i) => (
                <text
                  key={i}
                  x={getX(i)}
                  y={height - paddingBottom + 16}
                  textAnchor="middle"
                  className="text-[12px] font-semibold fill-content-muted"
                >
                  {d.month}
                </text>
              ))}
            </svg>
          </div>

          {/* Floating Tooltip in DOM */}
          {hoveredIdx !== null && (
            <div
              className="absolute bg-surface-card border border-cyan-400/30 rounded-xl p-3 shadow-glow z-10 text-[12px] space-y-1 select-none pointer-events-none font-mono animate-fadeIn"
              style={{
                left: `${(hoveredIdx / (data.length - 1)) * 70 + 12}%`,
                top: "10%",
              }}
            >
              <p className="font-bold text-content-title uppercase tracking-wide mb-1 border-b border-stroke pb-0.5">
                {data[hoveredIdx].month} 2026
              </p>
              <p className="flex justify-between gap-5 text-emerald-500 font-bold">
                <span>Receita:</span>
                <span>{formatCurrency(data[hoveredIdx].income)}</span>
              </p>
              <p className="flex justify-between gap-5 text-rose-500 font-bold">
                <span>Despesa:</span>
                <span>{formatCurrency(data[hoveredIdx].expense)}</span>
              </p>
              <p className="flex justify-between gap-5 text-cyan-400 font-bold pt-0.5 border-t border-stroke/50">
                <span>Saldo:</span>
                <span>
                  {formatCurrency(
                    data[hoveredIdx].income - data[hoveredIdx].expense,
                  )}
                </span>
              </p>
            </div>
          )}
        </Card.Content>
      </div>

      <div className="mt-4 pt-3.5 border-t border-stroke/70 flex items-center justify-between text-xs text-content-muted">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Média de Economia de{" "}
          <strong className="text-emerald-500 font-mono">48.2%</strong>
        </span>
      </div>
    </Card>
  );
}
