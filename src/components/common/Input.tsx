'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, helperText, isPassword = false, type = 'text', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={actualType}
            className={`w-full rounded-xl glass-input px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon || isPassword ? 'pr-10' : ''} ${
              error ? 'border-rose-500/80 focus:ring-rose-500/50' : 'border-zinc-800 focus:ring-indigo-500/50'
            } ${className}`}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-zinc-400" />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 text-zinc-400">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error && (
          <p className="text-xs text-rose-400 font-medium pl-1">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-zinc-500 font-normal pl-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
