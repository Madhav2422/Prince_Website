import { heroSlides } from "./home";
import { byCategory, type Product } from "./products";

/*
 * The photos each main page shows first. The pages render them with exactly these `src` and `sizes`, and
 * <ImageWarmup> fetches the same files ahead of time — so moving between pages lands with the pictures already in.
 * Keep the two in step by using these constants in the pages rather than repeating the values.
 */

export const HERO_SIZES = "100vw";
export const HOME_HERO_SIZES = "(min-width: 1024px) 78vw, 100vw";
export const PRODUCT_CARD_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

export const PAGE_HEROES = {
  shop: "/images/About_Us_bg_image.jpg",
  attars: "/images/attar-hero.png",
  customize: "/images/Hero_image_3.jpg",
  contact: "/images/About_Us_bg_image.jpg",
};

export type PageImage = { src: string; sizes: string };

/** The first row of product photos (four across on desktop). */
const firstCards = (products: Product[]): PageImage[] =>
  products
    .filter((product) => product.image)
    .slice(0, 4)
    .map((product) => ({ src: product.image, sizes: PRODUCT_CARD_SIZES }));

export const FIRST_IMAGES: Record<string, PageImage[]> = {
  "/": [{ src: heroSlides[0].image.src, sizes: HOME_HERO_SIZES }],
  "/shop": [{ src: PAGE_HEROES.shop, sizes: HERO_SIZES }, ...firstCards(byCategory("perfume"))],
  "/shop/attars": [{ src: PAGE_HEROES.attars, sizes: HERO_SIZES }, ...firstCards(byCategory("attar"))],
  "/customize": [{ src: PAGE_HEROES.customize, sizes: HERO_SIZES }],
  "/contact": [{ src: PAGE_HEROES.contact, sizes: HERO_SIZES }],
};
