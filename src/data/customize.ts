/** Each pick adds one 5 ml layer; six layers fill the 30 ml bottle. */
export const SLOT_ML = 5;
export const SLOT_COUNT = 6;
export const TOTAL_ML = SLOT_ML * SLOT_COUNT;

// TODO: set the real price for a custom 30 ml bottle.
export const CUSTOM_BOTTLE_PRICE = 999;

export type Scent = {
  slug: string;
  name: string;
  note: string;
  /** Liquid colour for this scent, bottom-to-top gradient. */
  from: string;
  to: string;
};

export const scents: Scent[] = [
  { slug: "strong-will", name: "Strong Will", note: "Fresh · Aromatic", from: "#c9d64a", to: "#eef58a" },
  { slug: "the-writer", name: "The Writer", note: "Woody · Amber", from: "#a8631a", to: "#e6a544" },
  { slug: "miraah", name: "Miraah", note: "Fresh · Aquatic", from: "#2f8fb5", to: "#7fd3ea" },
  { slug: "the-actor", name: "The Actor", note: "Charismatic · Warm", from: "#8c3b12", to: "#d97a35" },
  { slug: "jazz-club", name: "Jazz Club", note: "Warm · Bold", from: "#7a4a12", to: "#d9a13a" },
  { slug: "velvet-berry", name: "Velvet Berry", note: "Juicy · Sensual", from: "#8e1f45", to: "#e0558a" },
  { slug: "evoque", name: "Evoque", note: "Floral · Elegant", from: "#3f7a4a", to: "#9fd9a8" },
  { slug: "noir", name: "Noir", note: "Dark · Mysterious", from: "#2b2140", to: "#6b5a8f" },
];

export const getScent = (slug: string) => scents.find((scent) => scent.slug === slug);
