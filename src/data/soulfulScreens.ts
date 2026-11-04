import { BookHeart, Camera, Clapperboard, Music, Scissors, Smartphone, Tv, type LucideIcon } from "lucide-react";
import { contact } from "./contact";

export const SCREENS_PATH = "/soulful-screens";

/** Opens WhatsApp with a short enquiry already typed. */
export const screensWhatsApp = `${contact.whatsapp}?text=${encodeURIComponent(
  "Hi SoulfulScreens! I'd like to talk about a project.",
)}`;

/** Words that scroll through the film strip. */
export const screensReel = ["Films", "Ad Films", "Music Videos", "Reels", "Photography", "Post-Production"];

export type ScreensService = {
  icon: LucideIcon;
  title: string;
  text: string;
};

// TODO: confirm the services SoulfulScreens offers and adjust the copy.
export const screensServices: ScreensService[] = [
  {
    icon: Clapperboard,
    title: "Films & Short Films",
    text: "Stories with a beginning, a middle and a feeling that stays after the credits.",
  },
  {
    icon: Tv,
    title: "Ad Films",
    text: "Brand films and commercials that make people stop scrolling and start feeling.",
  },
  {
    icon: Music,
    title: "Music Videos",
    text: "Visuals that move with the track, from the first idea to the final cut.",
  },
  {
    icon: Smartphone,
    title: "Reels & Social",
    text: "Short, sharp vertical content made for Instagram and YouTube.",
  },
  {
    icon: Camera,
    title: "Photography",
    text: "Product, portrait and campaign shoots with a cinematic eye.",
  },
  {
    icon: Scissors,
    title: "Post-Production",
    text: "Editing, colour grading and sound that give every frame its finish.",
  },
  {
    icon: BookHeart,
    title: "Wedding Albums",
    text: "Candid, cinematic wedding photography, designed and bound into a premium album you'll open for years.",
  },
];

export const screensProcess = [
  { scene: "01", title: "Story", text: "We listen first — what you want people to feel, not just see." },
  { scene: "02", title: "Script", text: "The idea becomes a plan: script, shot list, locations and cast." },
  { scene: "03", title: "Shoot", text: "Lights, camera, soul. We capture it the way it deserves." },
  { scene: "04", title: "Screen", text: "Edit, colour and sound — then your story is ready for the world." },
];

/**
 * Showreel shown on the SoulfulScreens page.
 * TODO: paste the YouTube video id (the part after "v=" in the link) to embed the reel.
 */
export const screensShowreel = { youtubeId: "" };
