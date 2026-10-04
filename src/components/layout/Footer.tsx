import Image from "next/image";
import Link from "next/link";
import { socialLinks } from "@/data/navigation";

const hotspot =
  "absolute top-[36%] aspect-square w-[3.4%] min-w-7 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300 hover:bg-gold-500/15 focus-visible:outline-2 focus-visible:outline-gold-500";

export function Footer() {
  return (
    <footer className="bg-black">
      {/* Brand banner — the social icons are part of the artwork, so clickable hotspots sit over them */}
      <div className="relative mx-auto max-w-[2172px]">
        <Image
          src="/images/footer-banner-hd.png"
          alt="Capture moments, wear memories. Create, explore, smell, repeat — a more creative you."
          width={2172}
          height={341}
          sizes="100vw"
          className="block h-auto w-full"
        />
        {socialLinks.map(({ label, href, bannerX }) => {
          // An icon with nowhere to go yet gets no hotspot at all
          if (!href) return null;
          const style = { left: `${bannerX}%` };
          // Pages of this site go through the router; everything else opens in a new tab
          return href.startsWith("/") ? (
            <Link key={label} href={href} aria-label={label} style={style} className={hotspot} />
          ) : (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
              style={style}
              className={hotspot}
            />
          );
        })}
      </div>
    </footer>
  );
}
