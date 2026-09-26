import { IconBase, type IconComponentProps } from "./IconBase";

export function MoonIcon(props: IconComponentProps) {
  return (
    <IconBase {...props}>
      <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5a8.5 8.5 0 1 0 12 12Z" />
    </IconBase>
  );
}
