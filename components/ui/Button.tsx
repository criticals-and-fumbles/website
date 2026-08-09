import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

const VARIANTS = {
  primary: "bg-emerald text-bg hover:opacity-90",
  secondary:
    "border border-border text-text hover:border-emerald hover:text-emerald",
  ghost: "text-text hover:text-emerald",
} as const;

const baseClasses =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-5 py-2.5 font-ui text-sm transition-colors";

interface ButtonBaseProps {
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${baseClasses} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = "primary",
  className = "",
  external = false,
}: ButtonBaseProps & { href: string; external?: boolean }) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={`${baseClasses} ${VARIANTS[variant]} ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={`${baseClasses} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}
