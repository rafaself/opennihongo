import { IconBase, type IconComponentProps } from "./IconBase";

export function CloseIcon(props: IconComponentProps) {
  return (
    <IconBase {...props}>
      <path d="M6 6 18 18M18 6 6 18" />
    </IconBase>
  );
}
