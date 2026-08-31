'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'emerald' | 'clay';
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
    'inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[#C85A32] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-[#C85A32] text-[#FFFDF9] hover:bg-[#a84723] shadow-sm',
    secondary: 'bg-[#EBDDD0] text-[#1C2B22] hover:bg-[#dfcfc0] border border-[#1C3A27]/10',
    ghost: 'bg-transparent text-[#3A4D42] hover:bg-[#EBDDD0]/60',
    emerald: 'bg-[#1C3A27] text-[#FFFDF9] hover:bg-[#122619]',
    clay: 'bg-[#9E6B55] text-[#FFFDF9] hover:bg-[#835642]',
  };

  const sizes = {
    sm: 'h-9 px-3.5 text-[13px] rounded-[14px]',
    md: 'h-11 px-5 text-[14px] rounded-[18px]',
    lg: 'h-13 px-6 text-[15px] rounded-[22px]',
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
