import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
} from "lucide-react";

export interface Transaction {
  id: string;
  name: string;
  category: string;
  subcategory?: string | null;
  date: string;
  account: string;
  status: "confirmed" | "pending" | "blocked";
  type: "income" | "expense";
  value: string;
  secureSig: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  onOpenDetails?: (tx: Transaction) => void;
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const getStatusBadge = (status: "confirmed" | "pending" | "blocked") => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Confirmado</span>
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Shield className="w-3.5 h-3.5 animate-pulse" />
            <span>Pendente</span>
          </span>
        );
      case "blocked":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-shake">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Bloqueado</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse select-none">
        <thead>
          <tr className="border-b border-stroke text-[12px] font-bold uppercase tracking-wider text-content-muted">
            <th className="py-3.5 px-4">Transação</th>
            <th className="py-3.5 px-4">Categoria</th>
            <th className="py-3.5 px-4">Conta</th>
            <th className="py-3.5 px-4">Data</th>
            <th className="py-3.5 px-4">Criptografia / Assinatura</th>
            <th className="py-3.5 px-4 text-center">Status</th>
            <th className="py-3.5 px-4 text-right">Valor</th>
            <th className="py-3.5 px-4 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stroke/50 text-xs">
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="hover:bg-surface-hover/50 transition-colors duration-150 group"
            >
              {/* Name */}
              <td className="py-3.5 px-4 font-semibold text-content-title">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${
                      tx.type === "income"
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500"
                        : "bg-rose-500/10 border-rose-500/25 text-rose-500"
                    }`}
                  >
                    {tx.type === "income" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <span>{tx.name}</span>
                </div>
              </td>

              {/* Category */}
              <td className="py-3.5 px-4 text-content-body font-medium">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-xs uppercase tracking-wide bg-navy-50 dark:bg-navy-950 px-2 py-0.5 rounded border border-stroke text-content-title inline-block w-fit">
                    {tx.category}
                  </span>
                  {tx.subcategory && (
                    <span className="text-[10px] text-cyan-400 font-semibold font-mono pl-1">
                      ↳ {tx.subcategory}
                    </span>
                  )}
                </div>
              </td>

              {/* Account */}
              <td className="py-3.5 px-4 text-content-body font-medium">
                {tx.account}
              </td>

              {/* Date */}
              <td className="py-3.5 px-4 font-mono text-[12px] text-content-muted">
                {tx.date}
              </td>

              {/* Security Signature */}
              <td className="py-3.5 px-4 font-mono text-[12px] text-cyan-400">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{tx.secureSig}</span>
                </span>
              </td>

              {/* Status */}
              <td className="py-3.5 px-4 text-center">
                {getStatusBadge(tx.status)}
              </td>

              {/* Value */}
              <td
                className={`py-3.5 px-4 text-right font-mono font-bold text-sm ${
                  tx.type === "income"
                    ? "text-emerald-500"
                    : "text-content-title"
                }`}
              >
                {tx.type === "income" ? "+" : "-"} {tx.value}
              </td>

              {/* Actions */}
              <td className="py-3.5 px-4 text-center">
                <button className="p-1 text-content-muted hover:text-content-title rounded-lg hover:bg-surface-base transition-colors cursor-pointer focus:outline-none">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
