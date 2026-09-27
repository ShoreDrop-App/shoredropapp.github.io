import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-10", className)}>{children}</div>;
}

export function Eyebrow({ children, tone = "ochre", className }: { children: ReactNode; tone?: "ochre" | "light"; className?: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.16em]",
        tone === "ochre" ? "text-ochre" : "text-sand-surface/75",
        className,
      )}
    >
      <span aria-hidden className={cn("h-px w-6", tone === "ochre" ? "bg-ochre" : "bg-sand-surface/60")} />
      {children}
    </p>
  );
}

export function DisplayHeading({
  as: Tag = "h2",
  className,
  children,
}: {
  as?: "h1" | "h2" | "h3";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={cn("font-display font-normal tracking-[-0.02em] text-ink", className, "leading-[1.06]")}>{children}</Tag>
  );
}

export function PrimaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-[4px] bg-navy px-6 py-3.5 text-[15px] font-medium text-sand-surface transition-colors hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-sand-bg",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1.5 border-b border-ink/70 pb-1 text-[15px] font-medium text-ink transition-colors hover:border-ochre hover:text-navy",
        className,
      )}
    >
      {children}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}
