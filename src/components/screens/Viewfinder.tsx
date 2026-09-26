import type { CSSProperties, ReactNode } from "react";
import { BatteryFull } from "lucide-react";
import { Timecode } from "./Timecode";

/** Each corner starts pulled inward and settles out, like a camera locking focus. */
const corners = [
  { className: "left-0 top-0 border-l-2 border-t-2", pull: ["14px", "14px"] },
  { className: "right-0 top-0 border-r-2 border-t-2", pull: ["-14px", "14px"] },
  { className: "bottom-0 left-0 border-b-2 border-l-2", pull: ["14px", "-14px"] },
  { className: "bottom-0 right-0 border-b-2 border-r-2", pull: ["-14px", "-14px"] },
];

type ViewfinderProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Camera viewfinder overlay: focus brackets, a blinking REC light and running timecode.
 * Place it inside a `<Reveal>` to get the focus-lock animation when it scrolls into view.
 */
export function Viewfinder({ children, className = "" }: ViewfinderProps) {
  return (
    <div className={`relative ${className}`}>
      {children}

      <div aria-hidden className="pointer-events-none absolute inset-3 sm:inset-5">
        {corners.map(({ className: position, pull }) => (
          <span
            key={position}
            style={{ "--cx": pull[0], "--cy": pull[1] } as CSSProperties}
            className={`ss-corner absolute size-6 border-gold-500/90 sm:size-9 ${position}`}
          />
        ))}

        <div className="absolute inset-x-3 top-2.5 flex items-center justify-between text-[10px] font-medium tracking-[0.2em] text-cream/85 sm:inset-x-5 sm:top-4 sm:text-[11px]">
          <span className="flex items-center gap-2">
            <span className="ss-rec size-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
            REC
          </span>
          <Timecode />
        </div>

        <div className="absolute inset-x-3 bottom-2.5 flex items-center justify-between text-[10px] font-medium tracking-[0.2em] text-cream/60 sm:inset-x-5 sm:bottom-4 sm:text-[11px]">
          <span>16:9</span>
          <BatteryFull className="size-4" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
