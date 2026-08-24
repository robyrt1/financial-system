import { forwardRef } from "react";
import type { InputProps } from "./type";

export const InputRoot = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, icon, endAction, isMono = false, className = "", ...props },
    ref,
  ) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="text-xs font-bold uppercase tracking-wider text-content-muted block"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full py-3 bg-surface-base border rounded-xl text-content-title placeholder-slate-400 focus:outline-none focus:ring-2 transition-all text-sm
              ${icon ? "pl-10" : "pl-4"}
              ${endAction ? "pr-12" : "pr-4"}
              ${isMono ? "font-mono tracking-wider" : "font-sans"}
              ${
                error
                  ? "border-semantic-danger focus:ring-semantic-danger/50 focus:border-semantic-danger"
                  : "border-stroke focus:ring-cyan-400/50 focus:border-cyan-400"
              }
              ${className}
            `}
            {...props}
          />
          {endAction && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {endAction}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-semantic-danger font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

InputRoot.displayName = "InputRoot";
