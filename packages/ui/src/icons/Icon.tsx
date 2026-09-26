import type { ComponentType } from "react";
import { CheckIcon } from "./CheckIcon";
import { CloseIcon } from "./CloseIcon";
import { MoonIcon } from "./MoonIcon";
import { StarIcon } from "./StarIcon";
import { SunIcon } from "./SunIcon";
import type { IconComponentProps } from "./IconBase";

export type IconName = "check" | "close" | "moon" | "star" | "sun";

export type IconProps = IconComponentProps & {
  name: IconName;
};

const iconRegistry = {
  check: CheckIcon,
  close: CloseIcon,
  moon: MoonIcon,
  star: StarIcon,
  sun: SunIcon,
} satisfies Record<IconName, ComponentType<IconComponentProps>>;

/** Renders a stable name from the first-party functional icon registry. */
export function Icon({ name, ...props }: IconProps) {
  const RegisteredIcon = iconRegistry[name];

  return <RegisteredIcon {...props} />;
}
