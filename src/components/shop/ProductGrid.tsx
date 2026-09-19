"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { products } from "@/data/products";
import { ProductCard } from "./ProductCard";

const sortOptions = {
  featured: { label: "Featured", sort: () => 0 },
  "price-asc": { label: "Price: Low to High", sort: (a: number, b: number) => a - b },
  "price-desc": { label: "Price: High to Low", sort: (a: number, b: number) => b - a },
} as const;

type SortKey = keyof typeof sortOptions;

export function ProductGrid() {
  const [sortKey, setSortKey] = useState<SortKey>("featured");
  const sorted = [...products].sort((a, b) => sortOptions[sortKey].sort(a.price, b.price));

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <h2 className="text-sm font-medium uppercase tracking-[0.4em] text-cream sm:text-base">All Fragrances</h2>
        <span aria-hidden className="hidden h-px flex-1 bg-ink-600 md:block" />
        <p className="text-[11px] uppercase tracking-[0.25em] text-smoke">{products.length} Products</p>
        <label className="relative text-[11px] uppercase tracking-[0.25em] text-smoke">
          <span className="sr-only">Sort products</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="cursor-pointer appearance-none bg-transparent pr-6 uppercase tracking-[0.25em] text-cream focus-visible:outline-2 focus-visible:outline-gold-500"
          >
            {Object.entries(sortOptions).map(([key, { label }]) => (
              <option key={key} value={key} className="bg-ink-900">
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
            <ProductCard product={product} />
          </Reveal>
        ))}
      </ul>
    </>
  );
}
