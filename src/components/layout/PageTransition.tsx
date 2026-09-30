"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

/**
 * Smooth page changes: on every navigation the old page fades away and the new one rises gently into place
 * (the `page-exit` / `page-enter` view-transition classes in globals.css). Keyed by pathname, so moving between
 * nested routes such as /shop and /shop/attars animates too. Browsers without View Transitions just swap pages.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
