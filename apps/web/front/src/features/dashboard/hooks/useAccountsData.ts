import { useState, useEffect } from "react";
import { api } from "../../../app/api";
import {
  getUserIdFromToken,
  encryptLocal,
  decryptLocal,
} from "../../../app/crypto";

export interface AccountsSummary {
  consolidatedBalance: number;
  openInvoicesAmount: number;
  availableCreditLimit: number;
}

export interface BankAccount {
  id: string;
  name: string;
  type: "CHECKING" | "SAVINGS" | "INVESTMENT" | "BUSINESS" | "WALLET";
  balance: number;
  currency: string;
  syncStatus: "SYNCED" | "PENDING" | "FAILED";
  agency: string;
  accountNumber: string;
  encryptedDetails?: {
    encryptedData: string;
    iv: string;
    authTag: string;
  };
}

export interface CreditCard {
  id: string;
  accountId: string;
  cardName: string;
  maskedDigits: string;
  creditLimit: number;
  availableLimit: number;
  closingDay: number;
  dueDay: number;
}

export interface Projection {
  month: number;
  year: number;
  projectedAmount: number;
}

export function useAccountsData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AccountsSummary>({
    consolidatedBalance: 0,
    openInvoicesAmount: 0,
    availableCreditLimit: 0,
  });
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [projections, setProjections] = useState<Projection[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, accRes, cardRes, projRes] = await Promise.allSettled([
        api.get<AccountsSummary>("/accounts/summary"),
        api.get<BankAccount[]>("/accounts"),
        api.get<CreditCard[]>("/credit-cards"),
        api.get<Projection[]>("/invoices/projections"),
      ]);

      if (sumRes.status === "fulfilled") setSummary(sumRes.value.data);

      if (accRes.status === "fulfilled") {
        const userId = getUserIdFromToken();
        if (userId) {
          const decryptedAccounts = await Promise.all(
            accRes.value.data.map(async (account) => {
              try {
                if (account.encryptedDetails) {
                  const decryptedStr = await decryptLocal(
                    account.encryptedDetails.encryptedData,
                    account.encryptedDetails.iv,
                    account.encryptedDetails.authTag,
                    userId,
                  );
                  const details = JSON.parse(decryptedStr);
                  return {
                    ...account,
                    agency: details.agency,
                    accountNumber: details.accountNumber,
                  };
                }
              } catch (err) {
                console.error(
                  "Local decryption failed for account:",
                  account.id,
                  err,
                );
              }
              return {
                ...account,
                agency: "••••",
                accountNumber: "••••",
              };
            }),
          );
          setAccounts(decryptedAccounts);
        } else {
          setAccounts(accRes.value.data);
        }
      }

      if (cardRes.status === "fulfilled") setCards(cardRes.value.data);
      if (projRes.status === "fulfilled") {
        const mapped = (projRes.value.data as any[]).map((item) => ({
          month: item.month,
          year: item.year,
          projectedAmount: item.amount ?? 0,
        }));
        setProjections(mapped);
      }

      if (accRes.status === "rejected") {
        console.error("Failed to load accounts:", accRes.reason);
        setError("Falha ao carregar informações das contas bancárias.");
      }
    } catch (err) {
      console.error("Unexpected error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAccount = async (newAccount: {
    name: string;
    type: string;
    agency: string;
    accountNumber: string;
  }) => {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("Usuário não autenticado.");

    const encryptedDetails = await encryptLocal(
      JSON.stringify({
        agency: newAccount.agency,
        accountNumber: newAccount.accountNumber,
      }),
      userId,
    );

    await api.post("/accounts", {
      name: newAccount.name,
      type: newAccount.type,
      encryptedDetails,
    });
    await fetchData();
  };

  const handleCreateCard = async (newCard: {
    accountId: string;
    cardName: string;
    creditLimit: string;
    closingDay: string;
    dueDay: string;
    cardNumber: string;
    cvv: string;
    expirationDate: string;
  }) => {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("Usuário não autenticado.");

    const cleanCardNumber = newCard.cardNumber.replace(/\s+/g, "");
    const lastFour = cleanCardNumber.slice(-4);
    const maskedDigits = `•••• ${lastFour}`;

    const encryptedPayload = await encryptLocal(
      JSON.stringify({
        cardNumber: cleanCardNumber,
        cvv: newCard.cvv,
        expirationDate: newCard.expirationDate,
      }),
      userId,
    );

    await api.post("/credit-cards", {
      accountId: newCard.accountId,
      cardName: newCard.cardName,
      creditLimit: Number(newCard.creditLimit),
      closingDay: Number(newCard.closingDay),
      dueDay: Number(newCard.dueDay),
      maskedDigits,
      encryptedPayload,
    });
    await fetchData();
  };

  const handleAdjustLimit = async (cardId: string, adjustedLimit: string) => {
    await api.patch(`/credit-cards/${cardId}/limit`, {
      newLimit: Number(adjustedLimit),
    });
    await fetchData();
  };

  const handlePayInvoice = async (
    cardId: string,
    payMonth: string,
    payYear: string,
  ) => {
    await api.post(`/credit-cards/${cardId}/pay`, {
      month: Number(payMonth),
      year: Number(payYear),
    });
    await fetchData();
  };

  return {
    loading,
    error,
    summary,
    accounts,
    cards,
    projections,
    fetchData,
    handleCreateAccount,
    handleCreateCard,
    handleAdjustLimit,
    handlePayInvoice,
  };
}
