import React from 'react';
import { cn } from '../lib/utils';

export function Button({ className, variant = 'default', size = 'default', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline' | 'ghost' | 'destructive', size?: 'default' | 'sm' | 'lg' | 'icon' }) {
  const base = "inline-flex items-center justify-center rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variants = {
    default: "bg-[#FF4F00] text-white hover:bg-[#FF4F00]/90 shadow-md shadow-orange-200",
    outline: "border-2 border-slate-200 hover:bg-slate-50 hover:text-slate-900 bg-transparent text-slate-600",
    ghost: "hover:bg-slate-100 hover:text-slate-900 bg-transparent text-slate-600",
    destructive: "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-200"
  };
  const sizes = {
    default: "h-11 py-2 px-6",
    sm: "h-9 px-4 rounded-lg",
    lg: "h-14 px-8 rounded-2xl text-base",
    icon: "h-11 w-11"
  };
  
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200", className)} {...props} />
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-black tracking-tight text-slate-800", className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}
