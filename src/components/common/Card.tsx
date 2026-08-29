import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-beige bg-white/70 p-5 shadow-[0_2px_16px_-4px_rgba(109,30,47,0.08)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(109,30,47,0.15)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
