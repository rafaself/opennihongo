import type { ButtonHTMLAttributes } from 'react'
import './button.css'

export type ButtonVariant = 'primary' | 'secondary'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export function Button({
  className,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const classes = ['ns-button', className].filter(Boolean).join(' ')

  return (
    <button
      {...props}
      className={classes}
      data-variant={variant}
      type={type}
    />
  )
}
