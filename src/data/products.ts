export type Category = "perfume" | "attar";

export type Product = {
  slug: string;
  name: string;
  category: Category;
  /** Scent notes shown under the name. */
  notes: string[];
  /** Price in rupees. */
  price: number;
  /** Product photo. Empty means the card falls back to drawn artwork. */
  image: string;
  /** Colour used by the drawn artwork when there is no photo. */
  tint?: string;
  /** Filter chips on the Attars page. */
  tags?: string[];
  tagline: string;
};

// TODO: set the real prices and adjust the notes/taglines.
// Note: product-7.png is a duplicate of product-6.png (Jazz Club), so it is not used here.
export const products: Product[] = [
  {
    slug: "strong-will",
    name: "Strong Will",
    category: "perfume",
    notes: ["Fresh", "Aromatic", "Sporty"],
    price: 599,
    image: "/images/product-1.png",
    tagline: "Confidence in every step.",
  },
  {
    slug: "the-writer",
    name: "The Writer",
    category: "perfume",
    notes: ["Woody", "Amber", "Smooth"],
    price: 649,
    image: "/images/product-2.png",
    tagline: "Stories smell better now.",
  },
  {
    slug: "miraah",
    name: "Miraah",
    category: "perfume",
    notes: ["Fresh", "Aquatic", "Green"],
    price: 599,
    image: "/images/product-3.png",
    tagline: "Fresh instinct. Lasting presence.",
  },
  {
    slug: "the-actor",
    name: "The Actor",
    category: "perfume",
    notes: ["Charismatic", "Confident", "Versatile"],
    price: 699,
    image: "/images/product-4.png",
    tagline: "Many sides. One presence.",
  },
  {
    slug: "the-soulful",
    name: "The Soulful",
    category: "perfume",
    notes: ["Dreamy", "Creative", "Warm"],
    price: 699,
    image: "/images/product-5.png",
    tagline: "More than a fragrance. A feeling.",
  },
  {
    slug: "jazz-club",
    name: "Jazz Club",
    category: "perfume",
    notes: ["Warm", "Bold", "Smooth"],
    price: 749,
    image: "/images/product-6.png",
    tagline: "Good scents, great conversations.",
  },
  {
    slug: "velvet-berry",
    name: "Velvet Berry",
    category: "perfume",
    notes: ["Juicy", "Sensual", "Modern"],
    price: 649,
    image: "/images/product-8.png",
    tagline: "Sweet moments. Deeper stories.",
  },
  {
    slug: "evoque",
    name: "Evoque",
    category: "perfume",
    notes: ["Floral", "Elegant", "Classic"],
    price: 749,
    image: "/images/product-9.png",
    tagline: "Bold elegance. A modern classic.",
  },
  {
    slug: "the-director",
    name: "The Director",
    category: "perfume",
    notes: ["Bold", "Creative", "Memorable"],
    price: 699,
    image: "/images/product-10.png",
    tagline: "Vision in a bottle.",
  },
  {
    slug: "noir",
    name: "Noir",
    category: "perfume",
    notes: ["Dark", "Floral", "Mysterious"],
    price: 799,
    image: "/images/product-11.jpg",
    tagline: "Bold after dark.",
  },
];

// TODO: add real attar photos (public/images/...) and set `image` for each.
export const attars: Product[] = [
  {
    slug: "oud-al-afriki",
    name: "Oud Al Afriki",
    category: "attar",
    notes: ["Woody", "Smoky", "Deep"],
    price: 1400,
    image: "",
    tint: "#c98a2a",
    tags: ["Oud","Traditional"],
    tagline: "Deep African oud, aged and unhurried.",
  },
  {
    slug: "kewda",
    name: "Kewda",
    category: "attar",
    notes: ["Floral", "Fresh", "Soothing"],
    price: 550,
    image: "",
    tint: "#8fae6a",
    tags: ["Floral","Fresh"],
    tagline: "Cool monsoon flowers in a bottle.",
  },
  {
    slug: "zaffran",
    name: "Zaffran",
    category: "attar",
    notes: ["Spicy", "Rich", "Warm"],
    price: 1800,
    image: "",
    tint: "#d4742c",
    tags: ["Amber","Traditional"],
    tagline: "Saffron threads, warm and regal.",
  },
  {
    slug: "musk-rizali",
    name: "Musk Rizali",
    category: "attar",
    notes: ["Clean", "Soft", "Long Lasting"],
    price: 2000,
    image: "",
    tint: "#cfc6b0",
    tags: ["Musk"],
    tagline: "Soft white musk that stays all day.",
  },
  {
    slug: "ruh-gulab",
    name: "Ruh Gulab",
    category: "attar",
    notes: ["Pure", "Floral", "Classic"],
    price: 1500,
    image: "",
    tint: "#d98a9e",
    tags: ["Floral","Traditional"],
    tagline: "The soul of the rose, distilled.",
  },
];

export const allProducts: Product[] = [...products, ...attars];

export const byCategory = (category: Category) => allProducts.filter((product) => product.category === category);

/** Filter chips shown above the attar grid, in display order. */
export const attarTags = ["Oud", "Musk", "Floral", "Amber", "Traditional", "Fresh"];

export const getProduct = (slug: string) => allProducts.find((p) => p.slug === slug);

export const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;
