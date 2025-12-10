"use client";

import { ReactNode } from "react";
import clsx from "clsx";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
