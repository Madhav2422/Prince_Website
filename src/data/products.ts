export type Product = {
  slug: string;
  name: string;
  /** Scent notes shown under the name. */
  notes: string[];
  /** Price in rupees. */
  price: number;
  image: string;
  tagline: string;
};

// TODO: set the real prices and adjust the notes/taglines.
// Note: product-7.png is a duplicate of product-6.png (Jazz Club), so it is not used here.
export const products: Product[] = [
  {
    slug: "strong-will",
    name: "Strong Will",
    notes: ["Fresh", "Aromatic", "Sporty"],
    price: 599,
    image: "/images/product-1.png",
    tagline: "Confidence in every step.",
  },
  {
    slug: "the-writer",
    name: "The Writer",
    notes: ["Woody", "Amber", "Smooth"],
    price: 649,
    image: "/images/product-2.png",
    tagline: "Stories smell better now.",
  },
  {
    slug: "miraah",
    name: "Miraah",
    notes: ["Fresh", "Aquatic", "Green"],
    price: 599,
    image: "/images/product-3.png",
    tagline: "Fresh instinct. Lasting presence.",
  },
  {
    slug: "the-actor",
    name: "The Actor",
    notes: ["Charismatic", "Confident", "Versatile"],
    price: 699,
    image: "/images/product-4.png",
    tagline: "Many sides. One presence.",
  },
  {
    slug: "the-soulful",
    name: "The Soulful",
    notes: ["Dreamy", "Creative", "Warm"],
    price: 699,
    image: "/images/product-5.png",
    tagline: "More than a fragrance. A feeling.",
  },
  {
    slug: "jazz-club",
    name: "Jazz Club",
    notes: ["Warm", "Bold", "Smooth"],
    price: 749,
    image: "/images/product-6.png",
    tagline: "Good scents, great conversations.",
  },
  {
    slug: "velvet-berry",
    name: "Velvet Berry",
    notes: ["Juicy", "Sensual", "Modern"],
    price: 649,
    image: "/images/product-8.png",
    tagline: "Sweet moments. Deeper stories.",
  },
  {
    slug: "evoque",
    name: "Evoque",
    notes: ["Floral", "Elegant", "Classic"],
    price: 749,
    image: "/images/product-9.png",
    tagline: "Bold elegance. A modern classic.",
  },
  {
    slug: "the-director",
    name: "The Director",
    notes: ["Bold", "Creative", "Memorable"],
    price: 699,
    image: "/images/product-10.png",
    tagline: "Vision in a bottle.",
  },
  {
    slug: "noir",
    name: "Noir",
    notes: ["Dark", "Floral", "Mysterious"],
    price: 799,
    image: "/images/product-11.jpg",
    tagline: "Bold after dark.",
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;
