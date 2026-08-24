import React, { isValidElement, cloneElement } from "react";
import { twMerge } from "tailwind-merge";

import type { InputIconProps } from "./type";

export function InputIcon({
  icon,
  position: _position = "left",
  className = "",
  onClick,
  ...props
}: InputIconProps) {
  const baseStyle = "flex items-center justify-center transition-all";
  const interactiveStyle =
    "cursor-pointer focus:outline-none hover:text-cyan-400 focus:text-cyan-400 active:scale-95";
  const staticStyle = "pointer-events-none";

  const combinedClasses = twMerge(
    baseStyle,
    onClick ? interactiveStyle : staticStyle,
    className,
  );

  const renderIconContent = () => {
    const sizeClasses = "w-5 h-5";

    if (isValidElement(icon)) {
      const element = icon as React.ReactElement<{ className?: string }>;
      return cloneElement(element, {
        className: twMerge(sizeClasses, element.props.className),
      });
    }

    if (icon) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className={sizeClasses} />;
    }

    return null;
  };

  if (onClick) {
    return (
      <button
        type="button"
        className={combinedClasses}
        onClick={onClick}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {renderIconContent()}
      </button>
    );
  }

  return (
    <span className={combinedClasses} {...props}>
      {renderIconContent()}
    </span>
  );
}
