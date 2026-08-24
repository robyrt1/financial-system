import { twMerge } from "tailwind-merge";
import {
  LayoutDashboard,
  ArrowUpDown,
  Wallet,
  PieChart,
  Target,
  TrendingDown,
  Tags,
  Download,
  Settings,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({
  isCollapsed,
  activeTab,
  setActiveTab,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Transações", icon: ArrowUpDown },
    { id: "accounts", label: "Contas", icon: Wallet },
    { id: "budget", label: "Orçamento", icon: PieChart },
    { id: "goals", label: "Metas", icon: Target },
    { id: "debts", label: "Dívidas", icon: TrendingDown },
    { id: "categories", label: "Categorias", icon: Tags },
    { id: "export", label: "Exportação", icon: Download },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <aside
      className={twMerge(
        "bg-surface-panel border-r border-stroke h-screen fixed left-0 top-0 transition-all duration-300 z-30 flex flex-col justify-between select-none",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-stroke shrink-0">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-2xl font-bold text-cyan-400 select-none shrink-0">
              {":}"}
            </span>
            {!isCollapsed && (
              <span className="font-bold text-lg tracking-wider text-content-title animate-fadeIn">
                RMTECH
              </span>
            )}
          </div>
        </div>

        {/* Security Shield Indicator */}
        <div className={twMerge("p-4 shrink-0", isCollapsed ? "px-6" : "px-4")}>
          <div
            className={twMerge(
              "flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500",
              isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5",
            )}
          >
            <ShieldCheck className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <div className="text-left animate-fadeIn">
                <p className="text-[10px] font-bold uppercase tracking-wider leading-none">
                  Security System
                </p>
                <p className="text-[9px] opacity-80 leading-none mt-1">
                  Status: SECURE
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={twMerge(
                  "w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm font-medium transition-all group duration-200 cursor-pointer focus:outline-none",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-content-body hover:bg-surface-hover hover:text-content-title border border-transparent",
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={twMerge(
                    "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                    isActive
                      ? "text-cyan-400"
                      : "text-content-muted group-hover:text-content-title",
                  )}
                />
                {!isCollapsed && (
                  <span className="truncate text-left animate-fadeIn">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-stroke shrink-0">
        <div
          className={twMerge(
            "flex items-center gap-3",
            isCollapsed ? "justify-center" : "",
          )}
        >
          <div className="w-8 h-8 rounded-full bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center font-mono text-xs font-bold text-cyan-400 shrink-0">
            RM
          </div>
          {!isCollapsed && (
            <div className="text-left truncate animate-fadeIn">
              <p className="text-xs font-bold text-content-title leading-tight">
                Robert Mendes
              </p>
              <p className="text-[10px] text-content-muted leading-none mt-0.5">
                robert@rmtech.io
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
