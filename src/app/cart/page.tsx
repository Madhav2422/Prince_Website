import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cart",
  description: "Review your Soulful Smell order before sending it to us on WhatsApp.",
  path: "/cart",
});

export default function CartPage() {
  return (
    <section aria-label="Your cart" className="min-h-svh bg-ink-900 pb-20 pt-32 lg:pt-40">
      <Container>
        <p className="text-[11px] font-medium uppercase tracking-[0.45em] text-gold-500">Your selection</p>
        <h1 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4rem)] font-semibold uppercase leading-none tracking-[0.12em] text-cream">
          Shopping <span className="text-gold-500">Cart</span>
        </h1>
        <div className="mt-12">
          <CartView />
        </div>
      </Container>
    </section>
  );
}
