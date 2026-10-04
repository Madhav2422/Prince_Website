import type { Metadata } from "next";

export const SITE_NAME = "Soulful Smell";
export const SITE_URL = "https://www.soulfulsmell.com";
export const SITE_TITLE = `${SITE_NAME} — Fragrances That Stay`;
export const SITE_DESCRIPTION =
  "Soulful Smell brings you a world of timeless fragrances crafted for every mood, every moment and every you.";

/** The picture shown when a link to the site is shared: public/og-image.jpg, 1200 × 630 and small enough for WhatsApp. */
export const SHARE_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "A black Soulful Smell perfume bottle on a marble stand, beside the Soulful Smell logo",
};

type PageMetadata = {
  /** Short page name, e.g. "Shop" — the layout appends the site name. Leave out on the home page. */
  title?: string;
  description: string;
  /** The page's path, e.g. "/shop". */
  path: string;
};

/**
 * A page's title and description, repeated as Open Graph and Twitter tags so a link shared on WhatsApp, Instagram or
 * anywhere else shows a proper preview with a picture. Next replaces `openGraph` wholesale from one page to the next
 * instead of merging it, so every page has to spell it out in full, picture included — hence this helper.
 */
export function pageMetadata({ title, description, path }: PageMetadata): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_TITLE;
  return {
    ...(title && { title }),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      url: path,
      title: fullTitle,
      description,
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [SHARE_IMAGE],
    },
  };
}
