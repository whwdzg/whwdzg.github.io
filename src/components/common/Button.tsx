/** 基础按钮 / Buttons and icon buttons. */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={cn('btn', `btn--${variant}`, `btn--${size}`, className)} {...rest}>
      {icon && <span className="btn__icon">{icon}</span>}
      {children != null && <span className="btn__label">{children}</span>}
      {iconRight && <span className="btn__icon">{iconRight}</span>}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export function IconButton({
  label,
  children,
  className,
  size = 'md',
  active = false,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn('icon-btn', `icon-btn--${size}`, active && 'is-active', className)}
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
