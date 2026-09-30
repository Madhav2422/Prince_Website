import Image from "next/image";
import { Heart } from "lucide-react";
import { PRODUCT_CARD_SIZES } from "@/data/pageImages";
import { formatPrice, type Product } from "@/data/products";
import { AddToCartButton } from "./AddToCartButton";
import { VialArt } from "./VialArt";

export function ProductCard({ product, tone = "dark" }: { product: Product; tone?: "dark" | "light" }) {
  const light = tone === "light";

  return (
    <article
      className={`group flex h-full flex-col border transition-colors duration-500 ${
        light
          ? "border-sage-300 bg-sage-50 hover:border-navy-900/40"
          : "border-ink-600/70 bg-ink-950/60 hover:border-gold-500/60"
      }`}
    >
      <div className="relative aspect-square overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes={PRODUCT_CARD_SIZES}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="size-full transition-transform duration-700 ease-out group-hover:scale-105">
            <VialArt tint={product.tint} name={product.name} tone={tone} />
          </div>
        )}

        {light && (
          // TODO: wire up to a wishlist once accounts exist.
          <button
            type="button"
            aria-label={`Save ${product.name}`}
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-navy-900/70 transition-colors hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-navy-900"
          >
            <Heart className="size-5" strokeWidth={1.4} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center px-4 pb-5 pt-4 text-center">
        <h3
          className={`font-serif text-lg font-semibold uppercase tracking-[0.18em] ${light ? "text-navy-900" : "text-cream"}`}
        >
          {product.name}
        </h3>
        <p className={`mt-1.5 text-[11px] tracking-[0.12em] ${light ? "text-navy-500" : "text-smoke"}`}>
          {product.notes.join("  •  ")}
        </p>
        <p
          className={`mt-2 font-serif text-lg font-semibold tracking-wider ${light ? "text-navy-900" : "text-cream"}`}
        >
          {formatPrice(product.price)}
        </p>
        <div className="mt-auto flex w-full justify-center">
          <AddToCartButton slug={product.slug} name={product.name} tone={tone} />
        </div>
      </div>
    </article>
  );
}
