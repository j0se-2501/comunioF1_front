import { ReactNode } from "react";
import clsx from "clsx";

type CardVariant = "filled" | "outline";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
}

export function Card({
  children,
  className,
  variant = "filled",
}: CardProps) {
  const base = "rounded-2xl shadow-md p-4 md:p-6";

  const variantClasses: Record<CardVariant, string> = {
    filled: "bg-primary text-white",
    outline: "bg-white border border-primary text-primary",
  };

  return (
    <div className={clsx(base, variantClasses[variant], className)}>
      {children}
    </div>
  );
}
