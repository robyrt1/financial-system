import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
  className?: string;
}

export type ButtonIconVariant =
  "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonIconPosition = "start" | "end";

export interface ButtonIconProps extends React.SVGProps<SVGSVGElement> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>> | React.JSX.Element;
  className?: string;
  variant?: ButtonIconVariant;
  position?: "start" | "end";
  isLoading?: boolean;
}

export interface ButtonRootProps extends ButtonProps {
  children: React.ReactNode;
}
