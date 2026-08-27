import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-beige bg-white/70 p-5 shadow-[0_2px_16px_-4px_rgba(109,30,47,0.08)] backdrop-blur-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
