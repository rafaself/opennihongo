import type { ComponentType } from "react";
import { CheckIcon } from "./CheckIcon";
import { CloseIcon } from "./CloseIcon";
import { StarIcon } from "./StarIcon";
import type { IconComponentProps } from "./IconBase";

export type IconName = "check" | "close" | "star";

export type IconProps = IconComponentProps & {
  name: IconName;
};

const iconRegistry = {
  check: CheckIcon,
  close: CloseIcon,
  star: StarIcon,
} satisfies Record<IconName, ComponentType<IconComponentProps>>;

/** Renders a stable name from the first-party functional icon registry. */
export function Icon({ name, ...props }: IconProps) {
  const RegisteredIcon = iconRegistry[name];

  return <RegisteredIcon {...props} />;
}
