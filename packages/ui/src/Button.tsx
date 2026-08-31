'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'ochre';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-bold tracking-tight transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-[#F3F0E9] text-[#0D1D15] hover:bg-[#e4e0d7] shadow-md',
    secondary: 'bg-[#15261C] text-[#F3F0E9] border border-[#F3F0E9]/15 hover:bg-[#1C3325]',
    ghost: 'bg-transparent text-[#A6AAA4] hover:text-[#F3F0E9]',
    ochre: 'bg-[#D49B4B] text-[#0D1D15] hover:bg-[#c28c3e]',
  };

  const sizes = {
    sm: 'h-9 px-4 text-[13px] rounded-[12px]',
    md: 'h-11 px-5 text-[14px] rounded-[14px]',
    lg: 'h-13 px-6 text-[15px] rounded-[16px]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
