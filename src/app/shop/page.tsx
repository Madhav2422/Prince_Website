import type { Metadata } from "next";
import Image from "next/image";
import { CategoryTabs } from "@/components/shop/CategoryTabs";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Container } from "@/components/ui/Container";
import { HERO_SIZES, PAGE_HEROES } from "@/data/pageImages";
import { byCategory } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Explore the full Soulful Smell collection — long-lasting eau de parfums for every mood and moment.",
};

const sideText = "text-[11px] font-medium uppercase leading-[2.2] tracking-[0.3em] text-mist";

export default function ShopPage() {
  return (
    <>
      <section aria-label="Shop" className="relative isolate overflow-hidden bg-ink-950">
        <Image
          src={PAGE_HEROES.shop}
          alt=""
          fill
          priority
          sizes={HERO_SIZES}
          className="-z-20 object-cover object-[60%_45%]"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-ink-950/95 via-ink-950/60 to-ink-950/30" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink-900 via-transparent to-ink-950/70" />

        <Container className="relative flex min-h-[420px] items-end pb-14 pt-32 lg:min-h-[480px] lg:pt-40">
          <div aria-hidden className="absolute left-5 top-32 hidden sm:left-8 lg:left-12 lg:block">
            <p className={sideText}>
              Same
              <br />
              Places
              <br />
              Different
              <br />
              Scents
            </p>
            <span className="my-5 block h-px w-10 bg-smoke/60" />
            <p className={sideText}>
              A fragrance
              <br />
              for every
              <br />
              frame.
            </p>
          </div>

          <div className="mx-auto text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.45em] text-mist sm:text-xs">
              Explore our collection
            </p>
            <h1 className="mt-4 font-serif text-[clamp(3.5rem,8vw,6.5rem)] font-semibold uppercase leading-none tracking-[0.2em] text-gold-300">
              Shop
            </h1>
            <p className="mt-3 font-serif text-2xl italic tracking-wide text-cream/90 sm:text-3xl">Scents That Stay</p>
          </div>
        </Container>
      </section>

      <section aria-label="Perfumes" className="bg-ink-900">
        <Container className="py-12 lg:py-16">
          <div className="mb-10 border-b border-ink-700">
            <CategoryTabs active="perfume" />
          </div>
          <ProductGrid products={byCategory("perfume")} heading="All Perfumes" />
        </Container>
      </section>
    </>
  );
}
