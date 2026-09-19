"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { addToCart } from "@/lib/cart";

export function AddToCartButton({ slug, name }: { slug: string; name: string }) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function onClick() {
    addToCart(slug);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Add ${name} to cart`}
      className={`relative mt-4 w-full max-w-[11rem] overflow-hidden border py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 ${
        added ? "border-gold-500 bg-gold-500 text-ink-950" : "border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-ink-950"
      }`}
    >
      <span className={`flex items-center justify-center gap-2 transition-transform duration-300 ${added ? "-translate-y-8" : ""}`}>
        <ShoppingBag aria-hidden className="size-3.5" strokeWidth={2} />
        Add to Cart
      </span>
      <span
        aria-hidden
        className={`absolute inset-0 flex items-center justify-center gap-2 transition-transform duration-300 ${
          added ? "translate-y-0" : "translate-y-8"
        }`}
      >
        <Check className="size-3.5" strokeWidth={3} />
        Added
      </span>
    </button>
  );
}
