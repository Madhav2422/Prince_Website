"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { contact } from "@/data/contact";
import { formatPrice } from "@/data/products";
import { clearCart, removeFromCart, setQuantity, useCart } from "@/lib/cart";

const WHATSAPP_NUMBER = contact.phone.href.replace(/\D/g, "");

/** Builds the order summary that is sent to WhatsApp. */
function buildOrderMessage(items: ReturnType<typeof useCart>["items"], total: number) {
  const lines = [
    "*NEW ORDER — SOULFUL SMELL*",
    "------------------------------",
    ...items.map((item, i) => {
      const detail = item.custom
        ? [
            `    Blend: ${item.custom.layers.map((layer) => `${layer.name} ${layer.ml}ml`).join(", ")}`,
            item.custom.engraving ? `    Engraving: ${item.custom.engraving}` : "",
          ]
            .filter(Boolean)
            .join("\n") + "\n"
        : "";
      return `${i + 1}. *${item.product.name}*\n${detail}    ${formatPrice(item.product.price)} × ${item.quantity} = ${formatPrice(item.lineTotal)}`;
    }),
    "------------------------------",
    `*Total: ${formatPrice(total)}*`,
    "",
    "Please confirm my order. My details:",
    "Name: ",
    "Address: ",
    "Pincode: ",
  ];
  return lines.join("\n");
}

export function CartView() {
  const { items, count, total } = useCart();

  if (!items.length) {
    return (
      <div className="py-10 text-center">
        <p className="font-serif text-2xl uppercase tracking-[0.2em] text-cream">Your cart is empty</p>
        <p className="mt-3 text-sm text-mist">Add a fragrance and it will show up here.</p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-3 bg-gold-500 px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.18em] text-ink-950 transition-colors duration-300 hover:bg-gold-300"
        >
          Browse Fragrances
        </Link>
      </div>
    );
  }

  const checkoutUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderMessage(items, total))}`;

  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
      <ul className="divide-y divide-ink-700 border-y border-ink-700">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-5 sm:gap-6">
            <Link href={item.custom ? "/customize" : "/shop"} className="relative size-20 shrink-0 overflow-hidden sm:size-24">
              <Image src={item.product.image} alt={item.product.name} fill sizes="96px" className="object-cover" />
            </Link>

            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-base uppercase tracking-[0.15em] text-cream sm:text-lg">
                {item.product.name}
              </h2>
              {item.custom ? (
                <p className="mt-1 text-[11px] leading-relaxed text-smoke">
                  {item.custom.layers.map((layer) => `${layer.name} ${layer.ml}ml`).join(" · ")}
                  {item.custom.engraving && (
                    <span className="mt-0.5 block text-gold-500/90">Engraved “{item.custom.engraving}”</span>
                  )}
                </p>
              ) : (
                <p className="mt-1 text-[11px] tracking-[0.12em] text-smoke">{item.product.notes.join("  •  ")}</p>
              )}
              <p className="mt-1 text-sm text-mist sm:hidden">{formatPrice(item.product.price)}</p>
            </div>

            <p className="hidden w-24 text-right text-sm text-mist sm:block">{formatPrice(item.product.price)}</p>

            <div className="flex items-center border border-ink-600">
              <button
                type="button"
                onClick={() => setQuantity(item.id, item.quantity - 1)}
                aria-label={`Decrease ${item.product.name} quantity`}
                className="grid size-9 place-items-center text-mist transition-colors hover:text-gold-500"
              >
                <Minus className="size-3.5" strokeWidth={2} />
              </button>
              <span aria-live="polite" className="w-8 text-center text-sm text-cream">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(item.id, item.quantity + 1)}
                aria-label={`Increase ${item.product.name} quantity`}
                className="grid size-9 place-items-center text-mist transition-colors hover:text-gold-500"
              >
                <Plus className="size-3.5" strokeWidth={2} />
              </button>
            </div>

            <p className="hidden w-24 text-right font-serif text-lg text-cream md:block">{formatPrice(item.lineTotal)}</p>

            <button
              type="button"
              onClick={() => removeFromCart(item.id)}
              aria-label={`Remove ${item.product.name} from cart`}
              className="grid size-9 place-items-center text-smoke transition-colors hover:text-red-400"
            >
              <Trash2 className="size-4" strokeWidth={1.5} />
            </button>
          </li>
        ))}
      </ul>

      <aside className="h-fit border border-ink-600/70 bg-ink-950/60 p-6 lg:sticky lg:top-28">
        <h2 className="text-xs font-medium uppercase tracking-[0.35em] text-gold-500">Order Summary</h2>

        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between text-mist">
            <dt>Items</dt>
            <dd>{count}</dd>
          </div>
          <div className="flex justify-between text-mist">
            <dt>Shipping</dt>
            <dd>Confirmed on WhatsApp</dd>
          </div>
          <div className="flex justify-between border-t border-ink-700 pt-4 font-serif text-xl text-cream">
            <dt>Total</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>

        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-7 flex w-full items-center justify-center gap-3 bg-gold-500 px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.18em] text-ink-950 transition-colors duration-300 hover:bg-gold-300"
        >
          <WhatsAppIcon className="size-5" />
          Proceed to Checkout
        </a>

        <p className="mt-4 text-center text-xs leading-relaxed text-smoke">
          Your order opens in WhatsApp with the full list ready to send.
        </p>

        <button
          type="button"
          onClick={clearCart}
          className="mt-6 w-full text-center text-[11px] uppercase tracking-[0.25em] text-smoke transition-colors hover:text-red-400"
        >
          Clear cart
        </button>
      </aside>
    </div>
  );
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.22-8.24 8.22Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05s.89 2.38 1.01 2.54c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28Z" />
    </svg>
  );
}
