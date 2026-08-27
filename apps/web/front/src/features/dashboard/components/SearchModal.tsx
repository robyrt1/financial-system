import { useEffect, useState } from "react";
import { Search, ShieldAlert, FileText, ArrowRight, X } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onNewTransaction: () => void;
}

export function SearchModal({
  isOpen,
  onClose,
  onNavigateTab,
  onNewTransaction,
}: SearchModalProps) {
  const [query, setQuery] = useState("");

  // Handle Cmd+K / Ctrl+K keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger parent open logic
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: "goto-dashboard",
      title: "Ir para o Dashboard Principal",
      category: "Navegação",
      action: () => {
        onNavigateTab("dashboard");
        onClose();
      },
    },
    {
      id: "goto-transactions",
      title: "Ir para Transações / Extrato",
      category: "Navegação",
      action: () => {
        onNavigateTab("transactions");
        onClose();
      },
    },
    {
      id: "new-tx",
      title: "Registrar Nova Transação",
      category: "Financeiro",
      action: () => {
        onNewTransaction();
        onClose();
      },
    },
    {
      id: "run-sec-audit",
      title: "Forçar Varredura de Vulnerabilidades do Gateway",
      category: "Segurança",
      action: () => {
        alert("Iniciando auditoria completa de criptografia e assinaturas...");
        onClose();
      },
    },
    {
      id: "export-csv",
      title: "Exportar Relatório Consolidado (CSV)",
      category: "Dados",
      action: () => {
        alert("Exportação de dados autorizada e iniciada.");
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 select-none animate-fadeIn">
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Main search panel */}
      <div className="relative w-full max-w-lg bg-surface-card border border-stroke rounded-2xl shadow-glow overflow-hidden flex flex-col z-10 max-h-[400px]">
        {/* Header Search Box */}
        <div className="flex items-center px-4 border-b border-stroke">
          <Search className="w-5 h-5 text-content-muted shrink-0" />
          <input
            type="text"
            className="w-full py-4 px-3 bg-transparent text-sm text-content-title placeholder-content-muted focus:outline-none"
            placeholder="Digite um comando ou atalho..."
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-1 text-content-muted hover:text-content-title hover:bg-surface-base rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="w-full flex items-center justify-between p-3 hover:bg-surface-base rounded-xl transition-all duration-150 cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-surface-base border border-stroke flex items-center justify-center shrink-0">
                    {cmd.category === "Segurança" ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-content-muted" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-content-title">
                      {cmd.title}
                    </p>
                    <p className="text-[9px] text-content-muted uppercase tracking-wider font-mono mt-0.5">
                      {cmd.category}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-content-muted group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-content-muted">
              Nenhum comando encontrado para "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-surface-base border-t border-stroke text-[12px] text-content-muted flex items-center justify-between font-mono">
          <span>
            Use <kbd className="font-bold">↑↓</kbd> para navegar e{" "}
            <kbd className="font-bold">Enter</kbd> para selecionar
          </span>
          <span>
            <kbd className="font-bold">Esc</kbd> para fechar
          </span>
        </div>
      </div>
    </div>
  );
}
