import { twMerge } from "tailwind-merge";
import type { ButtonRootProps } from "./type";

export function ButtonRoot({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonRootProps) {
  const baseStyle =
    "w-full py-3 font-bold rounded-xl transform active:scale-95 transition-all text-sm flex items-center justify-center space-x-2 cursor-pointer focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:transform-none";

  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-navy-950 shadow-lg shadow-cyan-400/20 font-bold focus:ring-cyan-400/50 disabled:bg-none disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-400 disabled:border disabled:border-slate-200 dark:disabled:border-slate-700 disabled:shadow-none",
    secondary:
      "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-slate-500/50",
    ghost:
      "bg-transparent text-slate-400 hover:text-cyan-400 focus:ring-transparent",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(baseStyle, variants[variant], className)}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
