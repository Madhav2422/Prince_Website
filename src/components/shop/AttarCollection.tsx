"use client";

import { useState } from "react";
import { attarTags, byCategory } from "@/data/products";
import { ProductGrid } from "./ProductGrid";

const ALL = "All Attars";

export function AttarCollection() {
  const [tag, setTag] = useState(ALL);
  const attars = byCategory("attar");
  const shown = tag === ALL ? attars : attars.filter((attar) => attar.tags?.includes(tag));

  return (
    <ProductGrid
      products={shown}
      heading={ALL}
      tone="light"
      filters={attarTags.map((label) => ({ label, active: tag === label, onSelect: () => setTag(tag === label ? ALL : label) }))}
    />
  );
}
