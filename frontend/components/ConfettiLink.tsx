"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { fireConfetti } from "@/components/Confetti";

type ConfettiLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  confettiCount?: number;
};

/** A Link that pops a small confetti burst at the click point. */
export default function ConfettiLink({ children, confettiCount = 26, ...props }: ConfettiLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        fireConfetti(
          event.clientX || bounds.left + bounds.width / 2,
          event.clientY || bounds.top + bounds.height / 2,
          confettiCount,
        );
      }}
    >
      {children}
    </Link>
  );
}
