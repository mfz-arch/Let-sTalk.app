'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variantClasses = {
    primary:
      'bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm focus:ring-2 focus:ring-indigo-500/50',
    secondary:
      'bg-[#1A1D24] hover:bg-[#222630] text-zinc-100 border border-white/[0.07] font-semibold focus:ring-2 focus:ring-white/10',
    outline:
      'bg-transparent hover:bg-white/[0.04] text-zinc-200 border border-white/[0.07] font-semibold focus:ring-2 focus:ring-white/10',
    ghost:
      'bg-transparent hover:bg-white/[0.04] text-zinc-300 hover:text-white font-medium focus:ring-2 focus:ring-white/10',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-sm focus:ring-2 focus:ring-rose-500/50',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-sm gap-2.5',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
