import { useTranslation } from "react-i18next";

interface LockoutOverlayProps {
  countdown: number;
}

export function LockoutOverlay({ countdown }: LockoutOverlayProps) {
  const { t } = useTranslation();

  return (
    <div className="absolute inset-0 bg-slate-900/95 z-40 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm transition-all duration-300">
      <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500 flex items-center justify-center text-rose-500 mb-4 animate-bounce">
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        {t("auth.lockout.title")}
      </h3>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        {t("auth.lockout.desc")}
      </p>
      <div className="text-cyan-400 font-mono text-3xl font-bold tracking-wider mb-6 bg-navy-950 px-6 py-3 rounded-xl border border-navy-800">
        00:{countdown < 10 ? `0${countdown}` : countdown}s
      </div>
      <span className="text-[12px] text-slate-500 font-mono uppercase tracking-widest">
        {t("auth.lockout.secops")}
      </span>
    </div>
  );
}
