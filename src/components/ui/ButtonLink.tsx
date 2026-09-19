import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function ButtonLink({ href, children, className = "" }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 bg-gold-500 px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.18em] text-ink-950 transition-colors duration-300 hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500 ${className}`}
    >
      {children}
      <ArrowRight
        aria-hidden
        strokeWidth={2.25}
        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
      />
    </Link>
  );
}
