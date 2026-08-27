import React, { useState } from "react";
import { X } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import type { CreditCard } from "../../hooks/useAccountsData";
import { useTranslation } from "react-i18next";

interface PayInvoiceModalProps {
  card: CreditCard;
  onClose: () => void;
  onPayInvoice: (
    cardId: string,
    payMonth: string,
    payYear: string,
  ) => Promise<void>;
}

export const PayInvoiceModal: React.FC<PayInvoiceModalProps> = ({
  card,
  onClose,
  onPayInvoice,
}) => {
  const { t } = useTranslation();
  const [payMonth, setPayMonth] = useState("");
  const [payYear, setPayYear] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await onPayInvoice(card.id, payMonth, payYear);
      onClose();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("accounts.error_pay_invoice"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm relative animate-scaleUp p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-content-muted hover:text-content-title rounded-lg cursor-pointer focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-md font-bold text-content-title mb-4 select-none">
          {t("accounts.pay_invoice_title")}
        </h3>

        <p className="text-[12px] text-content-muted mb-4">
          {t("accounts.label_card")} <strong>{card.cardName}</strong> (
          {card.maskedDigits})
        </p>

        {formError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] rounded-xl mb-4">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[12px] uppercase font-bold text-content-muted">
                {t("accounts.label_invoice_month")}
              </label>
              <input
                type="number"
                required
                min={1}
                max={12}
                value={payMonth}
                onChange={(e) => setPayMonth(e.target.value)}
                className="w-full bg-navy-950 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                placeholder={t("accounts.placeholder_invoice_month")}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[12px] uppercase font-bold text-content-muted">
                {t("accounts.label_invoice_year")}
              </label>
              <input
                type="number"
                required
                value={payYear}
                onChange={(e) => setPayYear(e.target.value)}
                className="w-full bg-navy-950 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
                placeholder={t("accounts.placeholder_invoice_year")}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer mt-6 focus:outline-none"
          >
            {submitting
              ? t("accounts.submitting_processing")
              : t("accounts.btn_register_payment")}
          </button>
        </form>
      </Card>
    </div>
  );
};
