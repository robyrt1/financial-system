import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = "", ...props }, ref) => {
    return (
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          ref={ref}
          className={`
            mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-cyan-400 focus:ring-cyan-400 dark:focus:ring-cyan-400/30 cursor-pointer
            ${className}
          `}
          {...props}
        />
        <div className="text-xs">
          <label
            htmlFor={props.id}
            className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            {label}
          </label>
          {description && (
            <p className="text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
