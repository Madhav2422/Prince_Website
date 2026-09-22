import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Parisienne } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "Soulful Smell — Fragrances That Stay",
    template: "%s | Soulful Smell",
  },
  description:
    "Soulful Smell brings you a world of timeless fragrances crafted for every mood, every moment and every you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} ${cormorant.variable} ${parisienne.variable}`}>
      <body className="min-h-svh">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
