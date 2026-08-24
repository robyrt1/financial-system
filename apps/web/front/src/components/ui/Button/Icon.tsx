import React, { isValidElement, cloneElement } from "react";
import { twMerge } from "tailwind-merge";
import type {
  ButtonIconPosition,
  ButtonIconProps,
  ButtonIconVariant,
} from "./type";

const variantStyles: Record<ButtonIconVariant, string> = {
  primary: "text-current",
  secondary: "text-slate-400 dark:text-slate-300",
  outline: "text-cyan-600 dark:text-cyan-400",
  ghost: "text-slate-500",
  danger: "text-red-500 dark:text-red-400",
};

const positionStyles: Record<ButtonIconPosition, string> = {
  start: "-ml-0.5 mr-2",
  end: "-mr-0.5 ml-2",
};

function SpinnerIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function ButtonIcon({
  icon,
  className = "",
  variant = "primary",
  position = "start",
  isLoading = false,
  ...props
}: ButtonIconProps) {
  const sizeClasses = "w-4 h-4 shrink-0";
  const combinedClasses = twMerge(
    sizeClasses,
    positionStyles[position],
    variantStyles[variant],
    className,
  );

  if (isLoading) {
    return <SpinnerIcon className={combinedClasses} {...props} />;
  }

  if (isValidElement(icon)) {
    const element = icon as React.ReactElement<{ className?: string }>;
    return cloneElement(element, {
      className: `${combinedClasses} ${element.props.className || ""}`.trim(),
      ...props,
    } as any);
  }

  if (icon) {
    const IconComponent = icon as React.ComponentType<any>;
    return <IconComponent className={combinedClasses} {...props} />;
  }

  return null;
}
