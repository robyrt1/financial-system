import { Search, Download, Plus, Menu } from "lucide-react";
import { ThemeToggle } from "../../../components/ui/ThemeToggle";

interface TopbarProps {
  onSearchClick: () => void;
  onNewTransactionClick: () => void;
  onSidebarToggle: () => void;
}

export function Topbar({
  onSearchClick,
  onNewTransactionClick,
  onSidebarToggle,
}: TopbarProps) {
  return (
    <header className="h-16 border-b border-stroke bg-surface-panel/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left side: toggle, logo (mobile) and search trigger */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md min-w-0">
        <button
          onClick={onSidebarToggle}
          className="p-2 text-content-body hover:text-content-title hover:bg-surface-hover rounded-xl transition-all cursor-pointer focus:outline-none shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 md:hidden select-none shrink-0 mr-1 sm:mr-2">
          <span className="font-mono text-xl font-bold text-cyan-400">
            {":}"}
          </span>
          <span className="font-bold text-[12px] sm:text-sm tracking-wider text-content-title">
            RMTECH
          </span>
        </div>

        {/* Search trigger button */}
        <button
          onClick={onSearchClick}
          className="md:w-full flex items-center justify-between p-2 md:px-3.5 md:py-2 border border-stroke bg-surface-card rounded-xl text-sm text-content-muted hover:border-cyan-400/50 hover:text-content-body transition-all duration-200 cursor-pointer focus:outline-none shrink-0"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">Pesquisar...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 border border-stroke bg-surface-base rounded text-[12px] font-mono font-medium tracking-wide">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side: quick actions and theme */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            // Quick CSV download trigger
            alert("Exportação rápida iniciada...");
          }}
          className="hidden md:flex items-center gap-2 px-3.5 py-2.5 bg-surface-card border border-stroke hover:bg-surface-hover hover:text-cyan-400 text-content-body text-xs font-semibold rounded-xl transition-all cursor-pointer focus:outline-none"
        >
          <Download className="w-4 h-4" />
          <span>Exportação Rápida</span>
        </button>

        {/* Theme toggle from existing components */}
        <ThemeToggle />

        <button
          onClick={onNewTransactionClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-cyan-400 hover:bg-cyan-500 active:scale-95 text-navy-950 text-xs font-bold rounded-xl shadow-glow transition-all duration-200 cursor-pointer focus:outline-none"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nova Transação</span>
        </button>
      </div>
    </header>
  );
}
