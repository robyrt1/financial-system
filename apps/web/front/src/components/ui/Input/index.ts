import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { InputRoot } from "./Root";
import { InputIcon } from "./Icon";
import type { InputProps } from "./type";

type InputComponent = ForwardRefExoticComponent<
  InputProps & RefAttributes<HTMLInputElement>
> & {
  Root: typeof InputRoot;
  Icon: typeof InputIcon;
};

export const Input: InputComponent = Object.assign(InputRoot, {
  Root: InputRoot,
  Icon: InputIcon,
});

export * from "./type";
