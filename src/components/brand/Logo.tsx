import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Soulful Smell — Home"
      className={`group inline-flex flex-col items-center leading-none ${className}`}
    >
      <Image
        src="/images/soulful-smell-logo.png"
        alt="Soulful Smell"
        width={800}
        height={429}
        priority
        className="h-11 w-auto transition-opacity duration-300 group-hover:opacity-85 lg:h-14"
      />
     
    </Link>
  );
}
