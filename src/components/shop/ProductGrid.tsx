"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import type { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

const sortOptions = {
  featured: { label: "Featured", sort: () => 0 },
  "price-asc": { label: "Price: Low to High", sort: (a: number, b: number) => a - b },
  "price-desc": { label: "Price: High to Low", sort: (a: number, b: number) => b - a },
} as const;

type SortKey = keyof typeof sortOptions;

type ProductGridProps = {
  products: Product[];
  heading: string;
  tone?: "dark" | "light";
  /** Filter chips rendered next to the heading (Attars page). */
  filters?: { label: string; active: boolean; onSelect: () => void }[];
};

export function ProductGrid({ products, heading, tone = "dark", filters }: ProductGridProps) {
  const [sortKey, setSortKey] = useState<SortKey>("featured");
  const sorted = [...products].sort((a, b) => sortOptions[sortKey].sort(a.price, b.price));
  const light = tone === "light";

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <h2
          className={`text-sm font-medium uppercase tracking-[0.4em] sm:text-base ${light ? "text-navy-900" : "text-cream"}`}
        >
          {heading}
        </h2>

        {filters && (
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {filters.map((filter) => (
              <li key={filter.label}>
                <button
                  type="button"
                  onClick={filter.onSelect}
                  aria-pressed={filter.active}
                  className={`relative pb-1 text-[11px] uppercase tracking-[0.25em] transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:transition-transform after:duration-300 ${
                    light
                      ? "after:bg-navy-900 " + (filter.active ? "text-navy-900 after:scale-x-100" : "text-navy-500 hover:text-navy-900 after:scale-x-0 hover:after:scale-x-100")
                      : "after:bg-gold-500 " + (filter.active ? "text-cream after:scale-x-100" : "text-smoke hover:text-cream after:scale-x-0 hover:after:scale-x-100")
                  }`}
                >
                  {filter.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        <span aria-hidden className={`hidden h-px flex-1 md:block ${light ? "bg-navy-900/20" : "bg-ink-600"}`} />
        <p className={`text-[11px] uppercase tracking-[0.25em] ${light ? "text-navy-500" : "text-smoke"}`}>
          {products.length} Products
        </p>
        <label className={`relative text-[11px] uppercase tracking-[0.25em] ${light ? "text-navy-500" : "text-smoke"}`}>
          <span className="sr-only">Sort products</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className={`cursor-pointer appearance-none bg-transparent pr-6 uppercase tracking-[0.25em] focus-visible:outline-2 ${
              light ? "text-navy-900 focus-visible:outline-navy-900" : "text-cream focus-visible:outline-gold-500"
            }`}
          >
            {Object.entries(sortOptions).map(([key, { label }]) => (
              <option key={key} value={key} className={light ? "bg-sage-50 text-navy-900" : "bg-ink-900"}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2" />
        </label>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sorted.map((product, i) => (
          <Reveal as="li" key={product.slug} variant="up" delay={(i % 4) * 0.1} className="h-full">
            <ProductCard product={product} tone={tone} />
          </Reveal>
        ))}
      </ul>
    </>
  );
}
