import React from "react";
import { Wallet, MoreVertical } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import type { BankAccount } from "../../hooks/useAccountsData";
import { useTranslation } from "react-i18next";

interface BankAccountListProps {
  accounts: BankAccount[];
  formatCurrency: (val: number) => string;
}

export const BankAccountList: React.FC<BankAccountListProps> = ({
  accounts,
  formatCurrency,
}) => {
  const { t } = useTranslation();

  const getAccountTypeName = (type: string) => {
    const types: Record<string, string> = {
      CHECKING: t("accounts.type_checking"),
      SAVINGS: t("accounts.type_savings"),
      INVESTMENT: t("accounts.type_investment"),
      BUSINESS: t("accounts.type_business"),
      WALLET: t("accounts.type_wallet"),
    };
    return types[type] || type;
  };

  const getSyncStatusName = (status: string) => {
    const statuses: Record<string, string> = {
      SYNCED: t("accounts.status_synced"),
      PENDING: t("accounts.status_pending"),
      FAILED: t("accounts.status_failed"),
    };
    return statuses[status] || status;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-md font-bold uppercase tracking-wider text-content-title select-none">
        {t("accounts.bank_accounts_title")}
      </h2>

      {accounts.length === 0 ? (
        <Card className="p-8 text-center text-content-muted text-md">
          {t("accounts.empty_bank_accounts")}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-stroke">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-hover transition-colors"
              >
                {/* Account Name and details */}
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-md font-bold text-content-title">
                      {account.name}
                    </h4>
                    <p className="text-[12px] text-content-muted mt-0.5 flex items-center gap-1.5">
                      <span>{getAccountTypeName(account.type)}</span>
                      <span>•</span>
                      <span>
                        {t("accounts.agency_prefix")} {account.agency}
                      </span>
                      <span>•</span>
                      <span>
                        {t("accounts.account_prefix")} {account.accountNumber}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Sync status and balance */}
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-left sm:text-right">
                    <p className="text-[12px] text-content-muted uppercase tracking-wider font-bold">
                      {t("accounts.label_available_balance")}
                    </p>
                    <p
                      className={`font-mono font-bold text-md mt-0.5 ${account.balance >= 0 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {formatCurrency(account.balance)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        account.syncStatus === "SYNCED"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : account.syncStatus === "PENDING"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}
                    >
                      {getSyncStatusName(account.syncStatus)}
                    </span>

                    <button className="p-2 hover:bg-slate-800 text-content-muted hover:text-content-title rounded-lg transition-colors cursor-pointer focus:outline-none">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
