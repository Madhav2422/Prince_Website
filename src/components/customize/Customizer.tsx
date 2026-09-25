"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Plus, RotateCcw, ShoppingBag, X } from "lucide-react";
import { formatPrice } from "@/data/products";
import {
  CUSTOM_BOTTLE_PRICE,
  SLOT_COUNT,
  SLOT_ML,
  TOTAL_ML,
  getScent,
  scents,
} from "@/data/customize";
import { addCustomBlendToCart, type CustomBlend } from "@/lib/cart";
import {
  BottleVisual,
  CAP_OPEN_MS,
  POUR_GAP_MS,
  POUR_TOTAL_MS,
  type BottleLayer,
  type CapState,
  type Pour,
} from "./BottleVisual";

const MAX_ENGRAVING = 14;
/** The cap reseals after this long with no new scent added. */
const CLOSE_AFTER_MS = 5000;

type Timer = ReturnType<typeof setTimeout>;

export function Customizer() {
  const [layers, setLayers] = useState<BottleLayer[]>([]);
  const [pours, setPours] = useState<Pour[]>([]);
  const [cap, setCap] = useState<CapState>("idle");
  const [openCount, setOpenCount] = useState(0);
  const [engraving, setEngraving] = useState("");
  const [added, setAdded] = useState(false);

  const nextKey = useRef(0);
  /** Layer count updated synchronously, so rapid clicks can't overfill or share a fall target. */
  const layerCount = useRef(0);
  const capIsOpen = useRef(false);
  /** Timestamp when the next queued pour may start. */
  const pourFreeAt = useRef(0);
  const closeTimer = useRef<Timer>(undefined);
  const addedTimer = useRef<Timer>(undefined);
  const pourTimers = useRef(new Set<Timer>());

  useEffect(() => {
    const timers = pourTimers.current;
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(closeTimer.current);
      clearTimeout(addedTimer.current);
    };
  }, []);

  const filledMl = layers.length * SLOT_ML;
  const isFull = layers.length >= SLOT_COUNT;

  /** `now` is the click event timestamp (same clock as performance.now). */
  function addLayer(slug: string, now: number) {
    if (layerCount.current >= SLOT_COUNT) return;

    // Unscrew the cap first if it is sealed; the pour waits for it.
    const capDelay = capIsOpen.current ? 0 : CAP_OPEN_MS;
    if (!capIsOpen.current) {
      capIsOpen.current = true;
      setCap("open");
      setOpenCount((count) => count + 1);
    }

    // Queue behind any pour still in flight so each drop gets its own moment.
    const start = Math.max(now + capDelay, pourFreeAt.current);
    pourFreeAt.current = start + POUR_GAP_MS;
    const delay = Math.round(start - now);

    const key = nextKey.current++;
    const index = layerCount.current++;
    setLayers((current) => [...current, { key, slug, delay }]);
    setPours((current) => [...current, { key, slug, delay, index }]);

    const cleanup = setTimeout(
      () => {
        pourTimers.current.delete(cleanup);
        setPours((current) => current.filter((pour) => pour.key !== key));
      },
      delay + POUR_TOTAL_MS + 100,
    );
    pourTimers.current.add(cleanup);

    // Reseal once the bottle has been left alone for a while after the last pour.
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(
      () => {
        capIsOpen.current = false;
        setCap("closed");
      },
      delay + POUR_TOTAL_MS + CLOSE_AFTER_MS,
    );
  }

  function removeLayer(key: number) {
    layerCount.current = Math.max(0, layerCount.current - 1);
    setLayers((current) => current.filter((layer) => layer.key !== key));
  }

  function resetLayers() {
    layerCount.current = 0;
    setLayers([]);
  }

  function handleAddToCart() {
    if (!isFull) return;
    // Merge repeated scents so the order reads "Jazz Club 10 ml" rather than two separate 5 ml lines.
    const totals = new Map<string, number>();
    for (const layer of layers)
      totals.set(layer.slug, (totals.get(layer.slug) ?? 0) + SLOT_ML);

    const blend: CustomBlend = {
      engraving: engraving.trim(),
      layers: [...totals].map(([slug, ml]) => ({
        slug,
        name: getScent(slug)?.name ?? slug,
        ml,
      })),
    };

    addCustomBlendToCart(blend);
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 3500);
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-16">
      {/* Bottle preview — a compact sticky bar on mobile so the animation stays visible
          while scrolling the scent list, and a tall sticky panel from lg up. */}
      <div className="sticky top-20 z-20 -mx-5 flex items-center gap-3 border-b border-ink-700/60 bg-ink-950/95 px-5 py-3 backdrop-blur-sm sm:gap-5 sm:-mx-8 sm:px-8 lg:top-28 lg:z-auto lg:mx-0 lg:block lg:h-fit lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <div className="relative flex h-60 w-45 shrink-0 items-center justify-center sm:h-72 sm:w-60 lg:mx-auto lg:h-[420px] lg:w-full lg:max-w-[340px] xl:h-[480px]">
          <BottleVisual
            layers={layers}
            pours={pours}
            cap={cap}
            openCount={openCount}
            engraving={engraving.trim()}
          />
        </div>

        <div className="min-w-0 flex-1 lg:mx-auto lg:mt-6 lg:max-w-[340px] lg:flex-none">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
            <p className="font-serif text-lg text-cream lg:text-2xl">
              {filledMl}
              <span className="text-mist"> / {TOTAL_ML} ml</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-smoke lg:text-[11px] lg:tracking-[0.25em]">
              {layers.length} / {SLOT_COUNT} layers
            </p>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden bg-ink-700 lg:mt-3">
            <div
              className="h-full bg-gold-500 transition-[width] duration-700 ease-out"
              style={{ width: `${(layers.length / SLOT_COUNT) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div>
        <section aria-labelledby="cz-scents">
          <div className="flex items-center justify-between gap-4">
            <h2
              id="cz-scents"
              className="text-xs font-medium uppercase tracking-[0.35em] text-gold-500"
            >
              1 · Choose your scents
            </h2>
            {layers.length > 0 && (
              <button
                type="button"
                onClick={resetLayers}
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-smoke transition-colors hover:text-gold-500"
              >
                <RotateCcw aria-hidden className="size-3.5" strokeWidth={1.8} />
                Reset
              </button>
            )}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            Every tap adds {SLOT_ML} ml to the bottle. Pick the same scent twice
            to make it stronger.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {scents.map((scent) => {
              const used = layers.filter(
                (layer) => layer.slug === scent.slug,
              ).length;
              return (
                <li key={scent.slug}>
                  <button
                    type="button"
                    onClick={(event) => addLayer(scent.slug, event.timeStamp)}
                    disabled={isFull}
                    aria-label={`Add ${SLOT_ML} ml of ${scent.name}`}
                    className="group flex w-full items-center gap-3 border border-ink-600/70 bg-ink-950/50 px-4 py-3 text-left transition-colors duration-300 hover:border-gold-500/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink-600/70"
                  >
                    <span
                      aria-hidden
                      className="size-8 shrink-0 rounded-full ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
                      style={{
                        background: `linear-gradient(160deg, ${scent.to}, ${scent.from})`,
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-cream">
                        {scent.name}
                      </span>
                      <span className="block truncate text-[11px] tracking-wide text-smoke">
                        {scent.note}
                      </span>
                    </span>
                    {used > 0 ? (
                      <span className="shrink-0 text-[11px] font-semibold tracking-wider text-gold-500">
                        {used * SLOT_ML}ml
                      </span>
                    ) : (
                      <Plus
                        aria-hidden
                        className="size-4 shrink-0 text-smoke transition-colors group-hover:text-gold-500"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {layers.length > 0 && (
            <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-smoke">
              Tap a filled slot below to remove it.
            </p>
          )}

          {/* Slot strip */}
          <ol className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: SLOT_COUNT }, (_, i) => {
              const layer = layers[i];
              const scent = layer ? getScent(layer.slug) : null;
              return (
                <li
                  key={i}
                  className="flex-1 basis-[calc(33.333%-0.5rem)] sm:basis-[calc(16.666%-0.5rem)]"
                >
                  {layer && scent ? (
                    <button
                      type="button"
                      onClick={() => removeLayer(layer.key)}
                      aria-label={`Remove ${scent.name} layer ${i + 1}`}
                      className="group relative flex h-16 w-full flex-col items-center justify-center gap-1 border border-ink-600 px-1 text-center transition-colors hover:border-red-400/70"
                      style={{
                        background: `linear-gradient(180deg, ${scent.to}22, ${scent.from}44)`,
                      }}
                    >
                      <span className="line-clamp-2 text-[10px] leading-tight text-cream">
                        {scent.name}
                      </span>
                      <span className="text-[10px] font-semibold text-gold-400">
                        {SLOT_ML}ml
                      </span>
                      <span
                        aria-hidden
                        className="absolute -right-1.5 -top-1.5 grid size-4.5 place-items-center rounded-full bg-ink-950 text-cream/80 ring-1 ring-ink-600 transition-colors group-hover:bg-red-500/80 group-hover:text-cream group-hover:ring-red-400/70"
                      >
                        <X className="size-2.5" strokeWidth={2.5} />
                      </span>
                    </button>
                  ) : (
                    <span className="flex h-16 w-full items-center justify-center border border-dashed border-ink-600 text-[10px] uppercase tracking-[0.15em] text-smoke/60">
                      {SLOT_ML}ml
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="cz-engraving" className="mt-12">
          <h2
            id="cz-engraving"
            className="text-xs font-medium uppercase tracking-[0.35em] text-gold-500"
          >
            2 · Add your name
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            Optional — we engrave it on the bottle label. Leave it blank for a
            plain bottle.
          </p>
          <label htmlFor="engraving" className="sr-only">
            Name to engrave
          </label>
          <div className="mt-4 flex items-center gap-3">
            <input
              id="engraving"
              value={engraving}
              onChange={(e) =>
                setEngraving(e.target.value.slice(0, MAX_ENGRAVING))
              }
              placeholder="e.g. Madhav"
              maxLength={MAX_ENGRAVING}
              className="w-full max-w-xs border border-ink-600 bg-ink-950/60 px-4 py-3 text-sm text-cream placeholder:text-smoke/70 transition-colors duration-300 focus:border-gold-500 focus:outline-none"
            />
            <span className="text-[11px] tracking-widest text-smoke">
              {engraving.length}/{MAX_ENGRAVING}
            </span>
          </div>
        </section>

        <section
          aria-labelledby="cz-order"
          className="mt-12 border-t border-ink-700 pt-8"
        >
          <h2 id="cz-order" className="sr-only">
            3 · Add to cart
          </h2>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-smoke">
                Your {TOTAL_ML} ml bottle
              </p>
              <p className="mt-2 font-serif text-3xl text-cream">
                {formatPrice(CUSTOM_BOTTLE_PRICE)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isFull}
              className="inline-flex items-center gap-3 bg-gold-500 px-7 py-4 text-[13px] font-semibold uppercase tracking-[0.18em] text-ink-950 transition-colors duration-300 hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500 disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-smoke"
            >
              {added ? (
                <Check aria-hidden className="size-4" strokeWidth={3} />
              ) : (
                <ShoppingBag aria-hidden className="size-4" strokeWidth={2} />
              )}
              {added
                ? "Added to cart"
                : isFull
                  ? "Add to cart"
                  : `Fill ${TOTAL_ML - filledMl} ml more`}
            </button>
          </div>

          <p aria-live="polite" className="mt-4 min-h-6 text-sm">
            {added && (
              <span className="text-gold-400">
                Your bottle is in the cart.{" "}
                <Link
                  href="/cart"
                  className="underline underline-offset-4 hover:text-gold-300"
                >
                  View cart
                </Link>
              </span>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
