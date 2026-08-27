import { useState } from "react";
import { X, Save } from "lucide-react";

export interface NewDebtData {
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
  originalAmount: number;
  remainingBalance: number;
  totalInstallments: number;
  paidInstallments: number;
  monthlyPayment: number;
  monthlyInterestRate: number;
}

interface NewDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewDebtData) => void;
}

export function NewDebtModal({ isOpen, onClose, onSubmit }: NewDebtModalProps) {
  const [formData, setFormData] = useState<NewDebtData>({
    creditorName: "",
    type: "LOAN",
    originalAmount: 0,
    remainingBalance: 0,
    totalInstallments: 12,
    paidInstallments: 0,
    monthlyPayment: 0,
    monthlyInterestRate: 0,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      remainingBalance: formData.originalAmount,
    });
    setFormData({
      creditorName: "",
      type: "LOAN",
      originalAmount: 0,
      remainingBalance: 0,
      totalInstallments: 12,
      paidInstallments: 0,
      monthlyPayment: 0,
      monthlyInterestRate: 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-panel border border-stroke rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleUp">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stroke">
          <h3 className="font-bold text-content-title uppercase tracking-wider text-sm">
            Registrar Nova Dívida
          </h3>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-content-title cursor-pointer focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Creditor & Type */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                Credor / Banco
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Nubank, Caixa"
                value={formData.creditorName}
                onChange={(e) =>
                  setFormData({ ...formData, creditorName: e.target.value })
                }
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-xs text-content-title focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="col-span-1 space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                Tipo
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as any })
                }
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-xs text-content-title focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
              >
                <option value="INSTALLMENT_STORE">
                  Carnê / Crediário da Loja
                </option>
                <option value="CREDIT_CARD_PARCEL">
                  Parcelamento no Cartão
                </option>
                <option value="FINANCING">Financiamento</option>
                <option value="LOAN">Empréstimo Pessoal / Consignado</option>
                <option value="INFORMAL_DEBT">
                  Dívida Pessoal / Amigos & Família
                </option>
                <option value="OVERDRAFT">Cheque Especial / Rotativo</option>
                <option value="TAXES_GOV">Impostos & Tributos</option>
                <option value="RENEGOTIATION">Renegociação / Acordo</option>
              </select>
            </div>
          </div>

          {/* Balance & Interest */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                Saldo Total (BRL)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="50000.00"
                value={formData.originalAmount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalAmount: parseFloat(e.target.value),
                  })
                }
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-xs text-content-title font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                Taxa de Juros (% a.m.)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="2.5"
                value={formData.monthlyInterestRate || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    monthlyInterestRate: parseFloat(e.target.value),
                  })
                }
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-xs text-content-title font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Installments Setup */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                Total Parcelas
              </label>
              <input
                type="number"
                required
                placeholder="12"
                value={formData.totalInstallments || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalInstallments: parseInt(e.target.value, 10),
                  })
                }
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-xs text-content-title font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="col-span-1 space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                Parcelas Pagas
              </label>
              <input
                type="number"
                required
                placeholder="0"
                value={
                  formData.paidInstallments === 0
                    ? "0"
                    : formData.paidInstallments
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paidInstallments: parseInt(e.target.value, 10),
                  })
                }
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-xs text-content-title font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="col-span-1 space-y-1">
              <label className="text-[10px] font-bold text-content-muted uppercase">
                Valor Parcela
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="150.00"
                value={formData.monthlyPayment || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    monthlyPayment: parseFloat(e.target.value),
                  })
                }
                className="w-full bg-surface-base border border-stroke rounded-xl px-3.5 py-2.5 text-xs text-content-title font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stroke text-content-body hover:text-content-title hover:border-cyan-500/40 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 font-bold rounded-xl text-xs cursor-pointer shadow-lg transition-all bg-cyan-500 hover:bg-cyan-600 text-navy-950 shadow-cyan-500/10"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Dívida</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
