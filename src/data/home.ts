import { Heart, Leaf, ShieldCheck, Truck, type LucideIcon } from "lucide-react";

export type HeroSlide = {
  eyebrow: string;
  /** Rendered on two lines — the second line is highlighted in gold. */
  title: [string, string];
  description: string;
  cta: { label: string; href: string };
  image: {
    src: string;
    alt: string;
    /** CSS object-position — keeps the bottle in frame when the photo is cropped. */
    position: string;
  };
};

export const heroSlides: HeroSlide[] = [
  {
    eyebrow: "More than a fragrance",
    title: ["Wear", "The Aura"],
    description:
      "Soulful Smell brings you a world of timeless fragrances crafted for every mood, every moment and every you.",
    cta: { label: "Shop Now", href: "/shop" },
    image: {
      src: "/images/hero-image.jpg",
      alt: "Soulful Smell eau de parfum bottle resting on a black marble stand",
      position: "58% 50%",
    },
  },
  {
    eyebrow: "Fragrances that stay",
    title: ["Made To", "Linger"],
    description:
      "Long-lasting eau de parfums blended from the finest ingredients, made to stay with you from morning to midnight.",
    cta: { label: "Shop Now", href: "/shop" },
    image: {
      src: "/images/Hero_image_2.jpg",
      alt: "Soulful Smell bottle on wet stone with fresh lemon, jasmine and agarwood",
      position: "50% 50%",
    },
  },
  {
    eyebrow: "Crafted for every you",
    title: ["Find Your", "Scent"],
    description:
      "From deep oud to soft white musk — discover the signature that tells your story before you say a word.",
    cta: { label: "Collections", href: "/collections" },
    image: {
      src: "/images/Hero_image_3.jpg",
      alt: "Soulful Smell bottle on dark stone beside oud wood chips and rising smoke",
      position: "50% 50%",
    },
  },
];

export type Feature = {
  icon: LucideIcon;
  title: string;
  text: string;
};

export const features: Feature[] = [
  { icon: Leaf, title: "Premium Quality", text: "Finest Ingredients" },
  { icon: Truck, title: "Fast & Reliable", text: "Pan India Shipping" },
  { icon: ShieldCheck, title: "Secure Payments", text: "100% Safe & Trusted" },
  { icon: Heart, title: "Made With Passion", text: "For Fragrance Lovers" },
];
