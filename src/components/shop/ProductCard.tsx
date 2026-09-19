import Image from "next/image";
import { formatPrice, type Product } from "@/data/products";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex h-full flex-col border border-ink-600/70 bg-ink-950/60 transition-colors duration-500 hover:border-gold-500/60">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col items-center px-4 pb-5 pt-4 text-center">
        <h3 className="font-serif text-lg font-semibold uppercase tracking-[0.18em] text-cream">{product.name}</h3>
        <p className="mt-1.5 text-[11px] tracking-[0.12em] text-smoke">{product.notes.join("  •  ")}</p>
        <p className="mt-2 font-serif text-lg font-semibold tracking-wider text-cream">{formatPrice(product.price)}</p>
        <div className="mt-auto flex w-full justify-center">
          <AddToCartButton slug={product.slug} name={product.name} />
        </div>
      </div>
    </article>
  );
}
