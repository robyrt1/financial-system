import { Card } from "../../../components/ui/Card";
import { Calendar, Percent, Banknote } from "lucide-react";

export interface Debt {
  id: string;
  creditorName: string;
  type:
    | "FINANCING"
    | "LOAN"
    | "RENEGOTIATION"
    | "INSTALLMENT_STORE"
    | "CREDIT_CARD_PARCEL"
    | "INFORMAL_DEBT"
    | "OVERDRAFT"
    | "TAXES_GOV";
  monthlyInterestRate: number;
  totalInstallments: number;
  paidInstallments: number;
  remainingBalance: number;
  monthlyPayment: number;
  status: "ACTIVE" | "PAID_OFF";
}

interface DebtCardProps {
  debt: Debt;
  onPayInstallment: (id: string) => void;
  onAmortize: (id: string) => void;
}

export function DebtCard({
  debt,
  onPayInstallment,
  onAmortize,
}: DebtCardProps) {
  const percentage = Math.min(
    100,
    (debt.paidInstallments / debt.totalInstallments) * 100,
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusColor = () => {
    if (debt.status === "PAID_OFF")
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (debt.monthlyInterestRate > 3)
      return "text-amber-400 bg-amber-500/10 border-amber-500/20"; // warning se taxa > 3%
    return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
  };

  const getTypeLabel = () => {
    switch (debt.type) {
      case "INSTALLMENT_STORE":
        return "Carnê/Crediário";
      case "CREDIT_CARD_PARCEL":
        return "Parcelamento Cartão";
      case "FINANCING":
        return "Financiamento";
      case "LOAN":
        return "Empréstimo";
      case "INFORMAL_DEBT":
        return "Dívida Pessoal";
      case "OVERDRAFT":
        return "Cheque Especial";
      case "TAXES_GOV":
        return "Impostos";
      case "RENEGOTIATION":
        return "Renegociação";
      default:
        return debt.type;
    }
  };

  return (
    <Card className="flex flex-col justify-between overflow-hidden transition-all hover:border-cyan-500/30">
      <div className="p-5 flex flex-col gap-4">
        {/* Header: Name and Type */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-bold text-content-title tracking-wide">
              {debt.creditorName}
            </h3>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusColor()}`}
            >
              {getTypeLabel()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 bg-rose-500/5 px-2 py-1 rounded-lg border border-rose-500/10">
            <Percent className="w-3.5 h-3.5" />
            <span className="font-mono text-xs font-bold">
              {debt.monthlyInterestRate}% a.m.
            </span>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-1">
            <span className="text-[10px] text-content-muted font-bold uppercase tracking-wider flex items-center gap-1">
              <Banknote className="w-3 h-3" /> Saldo Devedor
            </span>
            <div className="text-xl font-bold font-mono text-content-title">
              {formatCurrency(debt.remainingBalance || 0)}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-content-muted font-bold uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Parcela Mensal
            </span>
            <div className="text-lg font-bold font-mono text-cyan-400">
              {formatCurrency(debt.monthlyPayment)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mt-2">
          <div className="flex justify-between items-end text-xs font-mono font-semibold">
            <span className="text-content-muted">Progresso</span>
            <span className="text-content-title">
              {debt.paidInstallments} de {debt.totalInstallments} pagas
            </span>
          </div>
          <div className="w-full bg-navy-950/60 rounded-full h-2 border border-stroke/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 100
                  ? "bg-emerald-500 shadow-emerald-500/50"
                  : "bg-cyan-500 shadow-cyan-500/50"
              } shadow-lg`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-4 bg-navy-950/30 border-t border-stroke/30">
        <button
          onClick={() => onPayInstallment(debt.id)}
          disabled={debt.status === "PAID_OFF"}
          className="flex-1 py-2 px-3 text-xs font-bold rounded-xl border border-stroke bg-surface-base hover:bg-surface-hover text-content-body hover:text-content-title transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Pagar Parcela
        </button>
        <button
          onClick={() => onAmortize(debt.id)}
          disabled={debt.status === "PAID_OFF"}
          className="flex-1 py-2 px-3 text-xs font-bold rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-navy-950 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Amortizar
        </button>
      </div>
    </Card>
  );
}
