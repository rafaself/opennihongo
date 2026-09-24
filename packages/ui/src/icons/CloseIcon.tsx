import { Icon, type IconProps } from "./Icon";

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6 18 18M18 6 6 18" />
    </Icon>
  );
}
