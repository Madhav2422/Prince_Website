import { Sparkle } from "lucide-react";

/** A strip of film rolling past: sprocket holes on both edges, words in the frames. */
export function FilmStrip({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <div className={`overflow-hidden bg-black ${className}`}>
      {/* Two identical copies side by side so the loop is seamless */}
      <div className="ss-marquee flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} aria-hidden={copy === 1 || undefined} className="ss-sprockets flex shrink-0 items-center py-5">
            {items.map((item) => (
              <li
                key={item}
                className="flex items-center gap-8 pr-8 font-serif text-xl font-semibold uppercase tracking-[0.22em] whitespace-nowrap text-cream/90 sm:gap-10 sm:pr-10 sm:text-2xl"
              >
                {item}
                <Sparkle aria-hidden className="size-3.5 fill-gold-500 text-gold-500" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
