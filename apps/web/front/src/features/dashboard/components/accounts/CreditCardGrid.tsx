import React from "react";
import { Calendar } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import type { CreditCard } from "../../hooks/useAccountsData";
import { useTranslation } from "react-i18next";

interface CreditCardGridProps {
  cards: CreditCard[];
  formatCurrency: (val: number) => string;
  onPayInvoice: (card: CreditCard) => void;
  onAdjustLimit: (card: CreditCard) => void;
}

export const CreditCardGrid: React.FC<CreditCardGridProps> = ({
  cards,
  formatCurrency,
  onPayInvoice,
  onAdjustLimit,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-wider text-content-title select-none">
        {t("accounts.credit_cards_title")}
      </h2>

      {cards.length === 0 ? (
        <Card className="p-8 text-center text-content-muted text-xs">
          {t("accounts.empty_credit_cards")}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const utilized = card.creditLimit - card.availableLimit;
            const percentUsed = Math.round((utilized / card.creditLimit) * 100);

            return (
              <Card
                key={card.id}
                className="overflow-hidden flex flex-col justify-between min-h-[220px] hover:bg-surface-hover transition-colors border border-cyan-500/10 hover:border-cyan-500/30 transition-all group p-5 shadow-2xl relative"
              >
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />

                {/* Card Front Top */}
                <div className="flex justify-between items-start z-10">
                  <div>
                    <span className="text-[12px] font-mono text-cyan-400/70 uppercase font-bold tracking-widest leading-none">
                      RMTECH Premium
                    </span>
                    <h4 className="text-xs font-bold text-content-title mt-1.5 leading-tight">
                      {card.cardName}
                    </h4>
                  </div>
                  {/* Simulated Card Chip & contactless wave */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-5.5 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md border border-yellow-200/30 flex flex-col justify-around p-0.5 shadow">
                      <div className="h-px bg-yellow-950/20 w-full" />
                      <div className="h-px bg-yellow-950/20 w-full" />
                      <div className="h-px bg-yellow-950/20 w-full" />
                    </div>
                    <svg
                      className="w-4 h-4 text-cyan-400/80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 12h.01M9 12a4 4 0 00-4-4m8 8a8 8 0 00-8-8" />
                    </svg>
                  </div>
                </div>

                {/* Masked Card Number */}
                <div className="my-5 text-sm tracking-[0.25em] font-mono text-content-title font-semibold z-10 select-all">
                  {card.maskedDigits}
                </div>

                {/* Limits and closing badges */}
                <div className="space-y-3 z-10">
                  <div className="flex justify-between items-center text-[12px]">
                    <div>
                      <p className="text-content-muted uppercase tracking-wider text-[12px] font-bold">
                        {t("accounts.label_current_invoice")}
                      </p>
                      <p className="font-mono font-bold text-red-400 mt-0.5 text-xs">
                        {formatCurrency(utilized)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-content-muted uppercase tracking-wider text-[12px] font-bold">
                        {t("accounts.label_available")}
                      </p>
                      <p className="font-mono font-bold text-cyan-400 mt-0.5 text-md">
                        {formatCurrency(card.availableLimit)}
                      </p>
                    </div>
                  </div>

                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all"
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-1 border-t border-stroke">
                    <span className="text-[10px] font-bold bg-navy-800 border border-stroke text-content-muted rounded px-1.5 py-0.5 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>
                        {t("accounts.badge_closing", { day: card.closingDay })}
                      </span>
                    </span>
                    <span className="text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded px-1.5 py-0.5 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>
                        {t("accounts.badge_due", { day: card.dueDay })}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Quick Action Overlay buttons */}
                <div className="mt-4 pt-3.5 border-t border-stroke flex justify-between gap-2 z-10">
                  <button
                    onClick={() => onPayInvoice(card)}
                    className="flex-1 py-1.5 hover:bg-emerald-500/10 hover:text-emerald-400 border border-transparent rounded-lg text-[12px] uppercase font-bold text-content-muted tracking-wider transition-colors cursor-pointer focus:outline-none"
                  >
                    {t("accounts.action_register_payment")}
                  </button>
                  <button
                    onClick={() => onAdjustLimit(card)}
                    className="flex-1 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 border border-transparent rounded-lg text-[12px] uppercase font-bold text-content-muted tracking-wider transition-colors cursor-pointer focus:outline-none"
                  >
                    {t("accounts.action_adjust_limit")}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
