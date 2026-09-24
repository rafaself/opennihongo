import { IconBase, type IconComponentProps } from "./IconBase";

export function StarIcon(props: IconComponentProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    </IconBase>
  );
}
