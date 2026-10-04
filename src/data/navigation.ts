export type NavLink = {
  label: string;
  href: string;
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Customize", href: "/customize" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export type SocialLink = {
  label: string;
  /** Where the icon leads. `null` until there is somewhere real to send people — it then stays plain artwork. */
  href: string | null;
  /** Hotspot position over the icon baked into the footer banner, as % of the banner width. */
  bannerX: number;
};

// The three icons are painted into the footer banner. Never point one at "#": a link that goes nowhere is worse
// than an icon that isn't a link.
export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/soulfulscreens", bannerX: 42.1 },
  // TODO: add the YouTube channel URL.
  { label: "YouTube", href: null, bannerX: 49.8 },
  { label: "Website", href: "/", bannerX: 56.9 },
];
