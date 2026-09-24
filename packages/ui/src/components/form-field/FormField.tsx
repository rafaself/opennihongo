import { cloneElement, type AriaAttributes, type ReactElement } from "react";
import "./form-field.css";

export type FormFieldControlProps = {
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
};

export type FormFieldProps = {
  children: ReactElement<FormFieldControlProps>;
  className?: string;
  description?: string;
  error?: string;
  id: string;
  label: string;
  required?: boolean;
};

export function FormField({
  children,
  className,
  description,
  error,
  id,
  label,
  required,
}: FormFieldProps) {
  const hasDescription = Boolean(description);
  const hasError = Boolean(error);
  const isRequired = required ?? children.props.required ?? false;
  const descriptionId = hasDescription ? `${id}-description` : undefined;
  const errorId = hasError ? `${id}-error` : undefined;
  const existingDescriptionIds =
    children.props["aria-describedby"]?.trim().split(/\s+/) ?? [];
  const describedBy = [
    ...new Set(
      [existingDescriptionIds, descriptionId, errorId]
        .flat()
        .filter((value): value is string => Boolean(value)),
    ),
  ].join(" ");
  const controlProps: Partial<FormFieldControlProps> = {
    id,
    required: isRequired,
    ...(describedBy ? { "aria-describedby": describedBy } : {}),
    ...(hasError ? { "aria-invalid": true } : {}),
  };
  const control = cloneElement(children, controlProps);
  const classes = ["ns-form-field", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <label className="ns-form-field__label" htmlFor={id}>
        <span>{label}</span>
        {isRequired && (
          <span aria-hidden="true" className="ns-form-field__required">
            (required)
          </span>
        )}
      </label>
      {control}
      {hasDescription && (
        <div className="ns-form-field__description" id={descriptionId}>
          {description}
        </div>
      )}
      {hasError && (
        <div className="ns-form-field__error" id={errorId}>
          {error}
        </div>
      )}
    </div>
  );
}
