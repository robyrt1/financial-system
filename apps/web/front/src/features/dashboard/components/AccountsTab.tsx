import { useState } from "react";
import {
  Wallet,
  CreditCard as CardIcon,
  ShieldCheck,
  Lock,
  Plus,
  Sliders,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { useAccountsData } from "../hooks/useAccountsData";
import type { CreditCard } from "../hooks/useAccountsData";
import { BankAccountList } from "./accounts/BankAccountList";
import { CreditCardGrid } from "./accounts/CreditCardGrid";
import { AddAccountOrCardModal } from "./accounts/AddAccountOrCardModal";
import { AdjustLimitModal } from "./accounts/AdjustLimitModal";
import { PayInvoiceModal } from "./accounts/PayInvoiceModal";

export default function AccountsTab() {
  const {
    loading,
    error,
    summary,
    accounts,
    cards,
    projections,
    handleCreateAccount,
    handleCreateCard,
    handleAdjustLimit,
    handlePayInvoice,
  } = useAccountsData();

  // Dialog visual states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const triggerPayInvoiceModal = (card: CreditCard) => {
    setSelectedCard(card);
    setIsPayOpen(true);
  };

  const triggerAdjustLimitModal = (card: CreditCard) => {
    setSelectedCard(card);
    setIsLimitOpen(true);
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-cyan-400 font-mono text-xs">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Acessando dados criptografados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stroke pb-5 select-none">
        <div>
          <h1 className="text-2xl font-bold text-content-title tracking-tight">
            Contas & Carteiras
          </h1>
          <p className="text-xs text-content-muted mt-1 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Sincronização bancária ativa e criptografada (E2EE Active)
            </span>
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/10 cursor-pointer focus:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Conta ou Cartão</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 flex flex-col justify-between select-none">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[12px] uppercase tracking-wider font-bold text-content-muted">
                Saldo Consolidado em Contas
              </span>
              <h3 className="text-md font-bold font-mono text-emerald-400 mt-2">
                {formatCurrency(summary.consolidatedBalance)}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[12px] text-content-muted mt-4 border-t border-stroke pt-3 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Disponível líquido sob custódia</span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between select-none">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[12px] uppercase tracking-wider font-bold text-content-muted">
                Faturas de Crédito em Aberto
              </span>
              <h3 className="text-md font-bold font-mono text-red-400 mt-2">
                {formatCurrency(summary.openInvoicesAmount)}
              </h3>
            </div>
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
              <CardIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 border-t border-stroke pt-3 space-y-1">
            <div className="flex justify-between text-[12px] text-content-muted font-mono">
              <span>Uso do limite global</span>
              <span>
                {summary.availableCreditLimit > 0
                  ? Math.round(
                      (summary.openInvoicesAmount /
                        (summary.openInvoicesAmount +
                          summary.availableCreditLimit)) *
                        100,
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    summary.availableCreditLimit > 0
                      ? Math.min(
                          100,
                          (summary.openInvoicesAmount /
                            (summary.openInvoicesAmount +
                              summary.availableCreditLimit)) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between select-none">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[12px] uppercase tracking-wider font-bold text-content-muted">
                Limite de Crédito Disponível Global
              </span>
              <h3 className="text-xl font-bold font-mono text-cyan-400 mt-2">
                {formatCurrency(summary.availableCreditLimit)}
              </h3>
            </div>
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
          </div>
          <div className="text-[14px] text-content-muted mt-4 border-t border-stroke pt-3 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="">Crédito utilizável ativo</span>
          </div>
        </Card>
      </div>

      {/* Credit Cards Section */}
      <CreditCardGrid
        cards={cards}
        formatCurrency={formatCurrency}
        onPayInvoice={triggerPayInvoiceModal}
        onAdjustLimit={triggerAdjustLimitModal}
      />

      {/* Bank Accounts List Section */}
      <BankAccountList accounts={accounts} formatCurrency={formatCurrency} />

      {/* Invoice Projection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-content-title select-none">
            Projeção de Faturas Futuras
          </h2>
          <Card className="p-5 flex flex-col justify-between min-h-[200px]">
            <div>
              <Card.Header className="mb-4">
                <Card.Title>Cronograma de Lançamento e Parcelas</Card.Title>
                <p className="text-[12px] text-content-muted mt-1">
                  Impacto estimado dos parcelamentos contratados nos ciclos
                  subsequentes.
                </p>
              </Card.Header>
              <Card.Content className="grid grid-cols-2 md:grid-cols-6 gap-3 select-none">
                {projections.map((proj, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-navy-950/40 border border-stroke rounded-xl flex flex-col justify-between hover:border-cyan-500/20 transition-all"
                  >
                    <span className="text-[9px] uppercase tracking-wider font-bold text-content-muted font-mono leading-none">
                      {new Date(
                        proj.year,
                        proj.month - 1,
                        1,
                      ).toLocaleDateString("pt-BR", { month: "short" })}
                      /{String(proj.year).slice(-2)}
                    </span>
                    <span className="text-xs font-mono font-bold text-content-title leading-none mt-2.5">
                      {formatCurrency(proj.projectedAmount)}
                    </span>
                  </div>
                ))}
              </Card.Content>
            </div>
            <div className="text-[9px] text-content-muted border-t border-stroke pt-3 mt-4 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dados consolidados de parcelas recorrentes ativas.</span>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-content-title select-none">
            Segurança Bancária
          </h2>
          <Card className="p-5 bg-cyan-500/5 border border-cyan-500/20 min-h-[200px] flex flex-col justify-between">
            <Card.Header className="mb-3">
              <Card.Title className="flex items-center gap-2 text-cyan-400">
                <Lock className="w-5 h-5" />
                <span>Zero-Knowledge Storage</span>
              </Card.Title>
            </Card.Header>
            <Card.Content className="text-xs text-content-body leading-relaxed space-y-3">
              <p>
                Os detalhes bancários e credenciais dos cartões são
                criptografados na máquina local antes de serem transmitidos.
              </p>
              <p className="text-[12px] text-content-muted">
                O servidor armazena apenas chaves públicas e hashes
                criptográficos e os dados cifrados por AES-256-GCM.
              </p>
            </Card.Content>
            <div className="pt-3 border-t border-cyan-500/10 text-[9px] text-cyan-400/80 font-mono">
              Encryption Algorithm:{" "}
              <strong>AES-256-GCM (Master Verified)</strong>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Modals */}
      {isAddOpen && (
        <AddAccountOrCardModal
          accounts={accounts}
          formatCurrency={formatCurrency}
          onClose={() => setIsAddOpen(false)}
          onCreateAccount={handleCreateAccount}
          onCreateCard={handleCreateCard}
        />
      )}

      {isLimitOpen && selectedCard && (
        <AdjustLimitModal
          card={selectedCard}
          onClose={() => {
            setIsLimitOpen(false);
            setSelectedCard(null);
          }}
          onAdjustLimit={handleAdjustLimit}
        />
      )}

      {isPayOpen && selectedCard && (
        <PayInvoiceModal
          card={selectedCard}
          onClose={() => {
            setIsPayOpen(false);
            setSelectedCard(null);
          }}
          onPayInvoice={handlePayInvoice}
        />
      )}
    </div>
  );
}
