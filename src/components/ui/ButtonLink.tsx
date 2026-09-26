import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** `outline` is for secondary actions next to a solid button. */
  variant?: "solid" | "outline";
};

const variants = {
  solid: "border-gold-500 bg-gold-500 text-ink-950 hover:border-gold-300 hover:bg-gold-300",
  outline: "border-gold-500/70 text-gold-400 hover:border-gold-500 hover:bg-gold-500 hover:text-ink-950",
};

export function ButtonLink({ href, children, className = "", variant = "solid" }: ButtonLinkProps) {
  const classes = `group inline-flex items-center gap-3 border px-6 py-3.5 text-[13px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500 ${variants[variant]} ${className}`;
  const content = (
    <>
      {children}
      <ArrowRight
        aria-hidden
        strokeWidth={2.25}
        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
      />
    </>
  );

  // Site pages go through the router; WhatsApp, Instagram, mailto: and tel: links are plain anchors.
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  const external = /^https?:/.test(href);
  return (
    <a href={href} className={classes} {...(external && { target: "_blank", rel: "noopener noreferrer" })}>
      {content}
    </a>
  );
}
