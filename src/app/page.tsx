import { CustomizeTeaser } from "@/components/home/CustomizeTeaser";
import { Features } from "@/components/home/Features";
import { GoodScentsBanner } from "@/components/home/GoodScentsBanner";
import { Hero } from "@/components/home/Hero";
import { OurStory } from "@/components/home/OurStory";
import { SoulfulScreensTeaser } from "@/components/home/SoulfulScreensTeaser";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <OurStory />
      <CustomizeTeaser />
      <GoodScentsBanner />
      <SoulfulScreensTeaser />
    </>
  );
}
