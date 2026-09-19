import Image from "next/image";

/** Full-width brand banner. The artwork already contains its headline, so it is shown uncropped. */
export function GoodScentsBanner() {
  return (
    <section aria-label="Good scents, brighter days" className="bg-[#f0b815]">
      <Image
        src="/images/homepage_3.png"
        alt="Good Scents, Brighter Days — because life smells better here. A cat looking up against a golden yellow background."
        width={1536}
        height={1024}
        sizes="(min-width: 900px) 900px, 100vw"
        className="mx-auto block h-auto w-full max-w-[900px] min-[900px]:mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      />
    </section>
  );
}
