import type { InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  endAction?: ReactNode;
  isMono?: boolean;
}

export type InputIconPosition = "left" | "right";

export interface InputIconProps extends React.HTMLAttributes<
  HTMLSpanElement | HTMLButtonElement
> {
  icon: React.ComponentType<any> | React.JSX.Element;
  position?: InputIconPosition;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}
