"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { navLinks } from "@/data/navigation";
import { useCart } from "@/lib/cart";

const iconButton =
  "inline-flex size-10 items-center justify-center rounded-full transition-colors duration-300 hover:text-gold-500 focus-visible:outline-2 focus-visible:outline-gold-500";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count: cartCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    // Also check once on mount — the page may load already scrolled (e.g. after a refresh).
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const solid = scrolled || menuOpen;

  return (
    <header
      // Stays put while pages change underneath it (see the site-header view transition in globals.css)
      style={{ viewTransitionName: "site-header" }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
        solid ? "bg-ink-950/85 shadow-[0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <Container className="flex h-20 items-center justify-between lg:h-24">
        <Logo className="ml-2 mt-2 sm:ml-4 lg:ml-8 lg:mt-3" />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-10 xl:gap-12">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative py-2 text-[15px] transition-colors duration-300 after:absolute after:-bottom-0.5 after:left-1/2 after:h-0.5 after:w-[calc(100%+14px)] after:-translate-x-1/2 after:bg-gold-500 after:transition-transform after:duration-300 hover:text-cream ${
                      active ? "text-cream after:scale-x-100" : "text-mist after:scale-x-0 hover:after:scale-x-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1 text-cream sm:gap-3">
          <button type="button" aria-label="Search" className={iconButton}>
            <Search className="size-5" strokeWidth={1.75} />
          </button>
          <Link href="/cart" aria-label={`Cart, ${cartCount} items`} className={`${iconButton} relative text-gold-500`}>
            <ShoppingBag className="size-5" strokeWidth={1.75} />
            <span
              key={cartCount}
              className={`absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-gold-500 text-[9px] font-bold text-ink-950 ${
                cartCount > 0 ? "animate-badge-pop" : ""
              }`}
            >
              {cartCount}
            </span>
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className={`${iconButton} lg:hidden`}
          >
            {menuOpen ? <X className="size-6" strokeWidth={1.5} /> : <Menu className="size-6" strokeWidth={1.5} />}
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        inert={!menuOpen}
        className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-400 lg:hidden ${
          menuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="min-h-0">
          <Container className="border-t border-ink-600/60 py-4">
            <ul>
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between border-b border-ink-700/70 py-4 text-sm uppercase tracking-[0.2em] transition-colors hover:text-gold-500 ${
                        active ? "text-gold-500" : "text-mist"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                
              </li>
            </ul>
          </Container>
        </nav>
      </div>
    </header>
  );
}
