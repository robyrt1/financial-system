import { twMerge } from "tailwind-merge";
import type { ValidationRulesProps } from "./type";

export function ValidationRulesRoot({
  rules = [],
  strength,
  className = "",
}: ValidationRulesProps) {
  if (rules.length === 0 && !strength) return null;

  return (
    <div className={twMerge("space-y-2 animate-fadeIn", className)}>
      {strength && (
        <div className="space-y-1.5">
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={twMerge(
                "h-full transition-all duration-500",
                strength.barClass,
              )}
              style={{ width: `${strength.percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400">
            <span
              className={twMerge(
                "transition-colors duration-300",
                strength.colorClass,
              )}
            >
              {strength.label}
            </span>
            {strength.subtitle && (
              <span className="font-mono text-slate-500">
                {strength.subtitle}
              </span>
            )}
          </div>
        </div>
      )}

      {rules.length > 0 && (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-400 list-none p-0 m-0 mt-2">
          {rules.map((rule) => (
            <li key={rule.id} className="flex items-center space-x-1">
              <svg
                className={twMerge(
                  "w-3.5 h-3.5 transition-colors duration-300 shrink-0",
                  rule.isValid ? "text-emerald-500" : "text-rose-500",
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {rule.isValid ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
              <span
                className={twMerge(
                  "transition-colors duration-300",
                  rule.isValid
                    ? "text-slate-700 dark:text-slate-300"
                    : "text-slate-400",
                )}
              >
                {rule.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
