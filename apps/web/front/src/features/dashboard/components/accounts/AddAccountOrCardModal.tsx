import React, { useState } from "react";
import { X } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import type { BankAccount } from "../../hooks/useAccountsData";
import { useTranslation } from "react-i18next";

interface AddAccountOrCardModalProps {
  accounts: BankAccount[];
  formatCurrency: (val: number) => string;
  onClose: () => void;
  onCreateAccount: (newAccount: {
    name: string;
    type: string;
    agency: string;
    accountNumber: string;
  }) => Promise<void>;
  onCreateCard: (newCard: {
    accountId: string;
    cardName: string;
    creditLimit: string;
    closingDay: string;
    dueDay: string;
    cardNumber: string;
    cvv: string;
    expirationDate: string;
  }) => Promise<void>;
}

export const AddAccountOrCardModal: React.FC<AddAccountOrCardModalProps> = ({
  accounts,
  formatCurrency,
  onClose,
  onCreateAccount,
  onCreateCard,
}) => {
  const { t } = useTranslation();
  const [addType, setAddType] = useState<"account" | "card">("account");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "CHECKING",
    agency: "",
    accountNumber: "",
  });

  const [newCard, setNewCard] = useState({
    accountId: "",
    cardName: "",
    creditLimit: "",
    closingDay: "10",
    dueDay: "15",
    cardNumber: "",
    cvv: "",
    expirationDate: "",
  });

  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await onCreateAccount(newAccount);
      onClose();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("accounts.error_create_account"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await onCreateCard(newCard);
      onClose();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("accounts.error_register_card"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto relative animate-scaleUp p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-content-muted hover:text-content-title rounded-lg cursor-pointer focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-md font-bold text-content-title mb-4 select-none">
          {t("accounts.add_title")}
        </h3>

        {/* Modal tabs selector */}
        <div className="flex bg-navy-950/80 p-1 rounded-xl border border-stroke mb-5">
          <button
            type="button"
            onClick={() => {
              setAddType("account");
              setFormError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              addType === "account"
                ? "bg-cyan-500 text-navy-950"
                : "text-content-muted hover:text-content-title"
            }`}
          >
            {t("accounts.tab_new_account")}
          </button>
          <button
            type="button"
            onClick={() => {
              setAddType("card");
              setFormError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              addType === "card"
                ? "bg-cyan-500 text-navy-950"
                : "text-content-muted hover:text-content-title"
            }`}
          >
            {t("accounts.tab_new_card")}
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] rounded-xl mb-4">
            {formError}
          </div>
        )}

        {addType === "account" ? (
          <form onSubmit={handleSubmitAccount} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[12px] uppercase font-bold text-content-muted">
                {t("accounts.label_name")}
              </label>
              <input
                type="text"
                required
                value={newAccount.name}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, name: e.target.value })
                }
                className="w-full bg-navy-100 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:bg-navy-950"
                placeholder={t("accounts.placeholder_name")}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[12px] uppercase font-bold text-content-muted">
                {t("accounts.label_type")}
              </label>
              <select
                value={newAccount.type}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, type: e.target.value })
                }
                className="w-full bg-navy-100 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:bg-navy-950"
              >
                <option value="CHECKING">{t("accounts.type_checking")}</option>
                <option value="SAVINGS">{t("accounts.type_savings")}</option>
                <option value="INVESTMENT">
                  {t("accounts.type_investment")}
                </option>
                <option value="BUSINESS">{t("accounts.type_business")}</option>
                <option value="WALLET">{t("accounts.type_wallet")}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] uppercase font-bold text-content-muted">
                  {t("accounts.label_agency")}
                </label>
                <input
                  type="text"
                  required
                  value={newAccount.agency}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, agency: e.target.value })
                  }
                  className="w-full bg-navy-100 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:bg-navy-950"
                  placeholder={t("accounts.placeholder_agency")}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] uppercase font-bold text-content-muted">
                  {t("accounts.label_account_number")}
                </label>
                <input
                  type="text"
                  required
                  value={newAccount.accountNumber}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      accountNumber: e.target.value,
                    })
                  }
                  className="w-full bg-navy-100 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:bg-navy-950"
                  placeholder={t("accounts.placeholder_account_number")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer mt-6 focus:outline-none"
            >
              {submitting
                ? t("accounts.submitting_encrypting")
                : t("accounts.btn_create_account")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitCard} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[12px] uppercase font-bold text-content-muted">
                {t("accounts.label_linked_account")}
              </label>
              <select
                required
                value={newCard.accountId}
                onChange={(e) =>
                  setNewCard({ ...newCard, accountId: e.target.value })
                }
                className="w-full bg-navy-100 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:bg-navy-950"
              >
                <option value="">{t("accounts.option_select_account")}</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] uppercase font-bold text-content-muted">
                {t("accounts.label_card_name")}
              </label>
              <input
                type="text"
                required
                value={newCard.cardName}
                onChange={(e) =>
                  setNewCard({ ...newCard, cardName: e.target.value })
                }
                className="w-full bg-navy-100 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:bg-navy-950"
                placeholder={t("accounts.placeholder_card_name")}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 col-span-1">
                <label className="text-[12px] uppercase font-bold text-content-muted">
                  {t("accounts.label_limit")}
                </label>
                <input
                  type="number"
                  required
                  value={newCard.creditLimit}
                  onChange={(e) =>
                    setNewCard({ ...newCard, creditLimit: e.target.value })
                  }
                  className="w-full bg-navy-100 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:bg-navy-950"
                  placeholder={t("accounts.placeholder_limit")}
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-[12px] uppercase font-bold text-content-muted">
                  {t("accounts.label_closing_day")}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={31}
                  value={newCard.closingDay}
                  onChange={(e) =>
                    setNewCard({ ...newCard, closingDay: e.target.value })
                  }
                  className="w-full bg-navy-100 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:bg-navy-950"
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-[12px] uppercase font-bold text-content-muted">
                  {t("accounts.label_due_day")}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={31}
                  value={newCard.dueDay}
                  onChange={(e) =>
                    setNewCard({ ...newCard, dueDay: e.target.value })
                  }
                  className="w-full bg-navy-100 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:bg-navy-950"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[12px] uppercase font-bold text-content-muted">
                {t("accounts.label_card_number")}
              </label>
              <input
                type="text"
                required
                value={newCard.cardNumber}
                onChange={(e) =>
                  setNewCard({ ...newCard, cardNumber: e.target.value })
                }
                className="w-full bg-navy-100 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:bg-navy-950"
                placeholder={t("accounts.placeholder_card_number")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[12px] uppercase font-bold text-content-muted">
                  {t("accounts.label_cvv")}
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={newCard.cvv}
                  onChange={(e) =>
                    setNewCard({ ...newCard, cvv: e.target.value })
                  }
                  className="w-full bg-navy-100 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:bg-navy-950"
                  placeholder={t("accounts.placeholder_cvv")}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[12px] uppercase font-bold text-content-muted">
                  {t("accounts.label_expiration")}
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={newCard.expirationDate}
                  onChange={(e) =>
                    setNewCard({ ...newCard, expirationDate: e.target.value })
                  }
                  className="w-full bg-navy-100 border border-stroke focus:border-cyan-500 text-content-title text-xs rounded-xl px-3.5 py-2.5 focus:outline-none dark:bg-navy-950"
                  placeholder={t("accounts.placeholder_expiration")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-navy-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer mt-6 focus:outline-none"
            >
              {submitting
                ? t("accounts.submitting_registering")
                : t("accounts.btn_register_card")}
            </button>
          </form>
        )}
      </Card>
    </div>
  );
};
