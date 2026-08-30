"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { trackHomepageEvent, type HomepageEventName } from "@/lib/analytics";

type HomepageTrackedLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  children: ReactNode;
  eventName: HomepageEventName;
};

export function HomepageTrackedLink({
  children,
  eventName,
  onClick,
  ...props
}: HomepageTrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackHomepageEvent(eventName);
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
