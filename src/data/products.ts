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

// TODO: set the real prices below — these are placeholders.
export const attars: Product[] = [
  {
    slug: "dusk-musk",
    name: "Dusk Musk",
    category: "attar",
    notes: ["Warm Musky", "Soft & Soothing", "Long Lasting"],
    price: 850,
    image: "/images/attar-1.png",
    tags: ["Musk", "Amber"],
    tagline: "When daylight fades, the real you linger.",
  },
  {
    slug: "choco-musk",
    name: "Choco Musk",
    category: "attar",
    notes: ["Rich Chocolate", "Soft Musk", "Long Lasting"],
    price: 900,
    image: "/images/attar-2.png",
    tags: ["Musk"],
    tagline: "Sweetness that stays.",
  },
  {
    slug: "deja-vu",
    name: "Deja Vu",
    category: "attar",
    notes: ["Oud Blend", "Resinous Depth", "Long Lasting"],
    price: 1600,
    image: "/images/attar-3.png",
    tags: ["Oud", "Traditional"],
    tagline: "A scent you've felt before.",
  },
  {
    slug: "berry-blast",
    name: "Berry Blast",
    category: "attar",
    notes: ["Juicy Berries", "Fresh & Vibrant", "Long Lasting"],
    price: 650,
    image: "/images/attar-4.png",
    tags: ["Fresh"],
    tagline: "A burst of joy.",
  },
  {
    slug: "gul",
    name: "Gul",
    category: "attar",
    notes: ["Radiant Floral", "Soft & Elegant", "Long Lasting"],
    price: 750,
    image: "/images/attar-5.png",
    tags: ["Floral", "Traditional"],
    tagline: "Pure petals forever.",
  },
  {
    slug: "musk-pureja",
    name: "Musk Pureja",
    category: "attar",
    notes: ["Pure Musk", "Clean & Soothing", "Long Lasting"],
    price: 800,
    image: "/images/attar-6.png",
    tags: ["Musk"],
    tagline: "Purity you can feel.",
  },
  {
    slug: "white-musk",
    name: "White Musk",
    category: "attar",
    notes: ["Pure Musk", "Soft Florals", "Long Lasting"],
    price: 850,
    image: "/images/attar-7.png",
    tags: ["Musk", "Floral"],
    tagline: "Pure. Soft. Timeless.",
  },
  {
    slug: "soulful-special",
    name: "Soulful Special",
    category: "attar",
    notes: ["Premium Oud Blend", "Exotic Florals", "Long Lasting"],
    price: 1800,
    image: "/images/attar-8.png",
    tags: ["Oud", "Floral"],
    tagline: "A blend beyond ordinary.",
  },
  {
    slug: "soul-touch",
    name: "Soul Touch",
    category: "attar",
    notes: ["Aquatic Fresh", "Clean Musky", "Spiritual Calm"],
    price: 950,
    image: "/images/attar-9.png",
    tags: ["Fresh", "Musk"],
    tagline: "A drop closer to peace.",
  },
  {
    slug: "sailor",
    name: "Sailor",
    category: "attar",
    notes: ["Oceanic Freshness", "Musky Depth", "Long Lasting"],
    price: 900,
    image: "/images/attar-10.png",
    tags: ["Fresh", "Musk"],
    tagline: "A scent beyond horizons.",
  },
  {
    slug: "impact",
    name: "Impact",
    category: "attar",
    notes: ["Spicy Sweet", "Rich Ambery", "Long Lasting"],
    price: 1100,
    image: "/images/attar-11.png",
    tags: ["Amber"],
    tagline: "A warmer presence.",
  },
];

export const allProducts: Product[] = [...products, ...attars];

export const byCategory = (category: Category) => allProducts.filter((product) => product.category === category);

/** Filter chips shown above the attar grid, in display order. */
export const attarTags = ["Oud", "Musk", "Floral", "Amber", "Traditional", "Fresh"];

export const getProduct = (slug: string) => allProducts.find((p) => p.slug === slug);

export const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;
