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

export type SocialLink = NavLink & {
  /** Hotspot position over the icon baked into the footer banner, as % of the banner width. */
  bannerX: number;
};

// TODO: replace the remaining "#" links with the real YouTube / website URLs.
export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/soulfulscreens", bannerX: 42.1 },
  { label: "YouTube", href: "#", bannerX: 49.8 },
  { label: "Website", href: "#", bannerX: 56.9 },
];
