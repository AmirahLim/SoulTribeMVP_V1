'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'sage' | 'clay';
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
    'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants = {
    primary: 'bg-[#C85A32] text-[#FFFDF9] hover:bg-[#a84723] shadow-sm',
    secondary: 'bg-[#EFE5D8] text-[#2D2118] hover:bg-[#e2d5c4] border border-[#2D2118]/10',
    ghost: 'bg-transparent text-[#4A3B30] hover:bg-[#EFE5D8]/60',
    sage: 'bg-[#2E5345] text-[#FFFDF9] hover:bg-[#223e34]',
    clay: 'bg-[#9E6B55] text-[#FFFDF9] hover:bg-[#835642]',
  };

  const sizes = {
    sm: 'h-9 px-3.5 text-[13px] rounded-[12px]',
    md: 'h-11 px-5 text-[15px] rounded-[16px]',
    lg: 'h-13 px-7 text-[17px] rounded-[20px]',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
