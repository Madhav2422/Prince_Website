import Link from "next/link";
import type { Category } from "@/data/products";

const tabs: { label: string; href: string; category: Category }[] = [
  { label: "Perfumes", href: "/shop", category: "perfume" },
  { label: "Attars", href: "/shop/attars", category: "attar" },
];

export function CategoryTabs({ active, tone = "dark" }: { active: Category; tone?: "dark" | "light" }) {
  return (
    <nav aria-label="Product categories">
      <ul className="flex items-center gap-8">
        {tabs.map((tab) => {
          const isActive = tab.category === active;
          const inactive = tone === "light" ? "text-ink-800/60 hover:text-ink-950" : "text-smoke hover:text-cream";
          const current = tone === "light" ? "text-ink-950" : "text-cream";
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`relative block pb-2 text-sm font-medium uppercase tracking-[0.3em] transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-gold-500 after:transition-transform after:duration-300 ${
                  isActive ? `${current} after:scale-x-100` : `${inactive} after:scale-x-0 hover:after:scale-x-100`
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
