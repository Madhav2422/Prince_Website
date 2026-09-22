"use client";

import { useSyncExternalStore } from "react";
import { CUSTOM_BOTTLE_PRICE, TOTAL_ML } from "@/data/customize";
import { getProduct, type Product } from "@/data/products";

/** A personalised 30 ml bottle built on the Customize page. */
export type CustomBlend = {
  /** Optional name engraved on the bottle. */
  engraving: string;
  /** One entry per scent used, with its total millilitres. */
  layers: { slug: string; name: string; ml: number }[];
};

export type CartLine = {
  /** Unique per line: the product slug, or a signature for a custom blend. */
  id: string;
  slug: string;
  quantity: number;
  custom?: CustomBlend;
};

const STORAGE_KEY = "soulful-cart";
const EMPTY: CartLine[] = [];
const CUSTOM_SLUG = "custom-blend";

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Storage can be unavailable (private mode, blocked cookies) — the cart still works for this visit.
  }
}

function isValid(line: CartLine) {
  if (!line || typeof line.slug !== "string" || !Number.isFinite(line.quantity) || line.quantity <= 0) return false;
  return line.slug === CUSTOM_SLUG ? Array.isArray(line.custom?.layers) && line.custom.layers.length > 0 : !!getProduct(line.slug);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) {
      lines = parsed.filter((line): line is CartLine => isValid(line as CartLine)).map((line) => ({
        ...line,
        id: line.id ?? line.slug,
        quantity: Math.min(99, Math.round(line.quantity)),
      }));
    }
  } catch {
    lines = EMPTY;
  }
}

function subscribe(listener: () => void) {
  // The first subscriber restores the saved cart — after hydration, so server and client markup match.
  if (!loaded) {
    loaded = true;
    load();
    if (lines.length) queueMicrotask(emit);
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function update(next: CartLine[]) {
  lines = next;
  persist();
  emit();
}

function addLine(line: CartLine) {
  const existing = lines.find((entry) => entry.id === line.id);
  update(
    existing
      ? lines.map((entry) =>
          entry.id === line.id ? { ...entry, quantity: Math.min(99, entry.quantity + line.quantity) } : entry,
        )
      : [...lines, line],
  );
}

export const addToCart = (slug: string, quantity = 1) => addLine({ id: slug, slug, quantity });

/** Adds a personalised bottle. Identical blends (same scents + engraving) merge into one line. */
export function addCustomBlendToCart(custom: CustomBlend, quantity = 1) {
  const signature = custom.layers
    .map((layer) => `${layer.slug}:${layer.ml}`)
    .sort()
    .join("|");
  addLine({
    id: `${CUSTOM_SLUG}__${signature}__${custom.engraving.trim().toLowerCase()}`,
    slug: CUSTOM_SLUG,
    quantity,
    custom,
  });
}

export function setQuantity(id: string, quantity: number) {
  if (quantity <= 0) return removeFromCart(id);
  update(lines.map((line) => (line.id === id ? { ...line, quantity: Math.min(99, quantity) } : line)));
}

export const removeFromCart = (id: string) => update(lines.filter((line) => line.id !== id));

export const clearCart = () => update(EMPTY);

export const useCartLines = () =>
  useSyncExternalStore(
    subscribe,
    () => lines,
    () => EMPTY,
  );

/** What the cart renders: a product (real or synthesised for custom blends) plus totals. */
export type CartItem = CartLine & { product: Product; lineTotal: number };

const customProduct = (custom: CustomBlend): Product => ({
  slug: CUSTOM_SLUG,
  name: `Custom ${TOTAL_ML} ml Blend`,
  category: "perfume",
  notes: custom.layers.map((layer) => layer.name),
  price: CUSTOM_BOTTLE_PRICE,
  image: "/images/product-5.png",
  tagline: custom.engraving ? `Engraved “${custom.engraving}”` : "Your own blend.",
});

export function useCart() {
  const cartLines = useCartLines();
  const items: CartItem[] = cartLines.flatMap((line) => {
    const product = line.custom ? customProduct(line.custom) : getProduct(line.slug);
    return product ? [{ ...line, product, lineTotal: product.price * line.quantity }] : [];
  });

  return {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
}
