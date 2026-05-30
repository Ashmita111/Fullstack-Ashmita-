import type { ButtonHTMLAttributes } from 'react';

const variantStyles: Record<string, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-700',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
  danger: 'border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
};

export function Button({
  variant = 'primary',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-500 ${variantStyles[variant]} ${
        disabled ? 'cursor-not-allowed opacity-60' : ''
      } ${className}`}
      {...props}
    />
  );
}
