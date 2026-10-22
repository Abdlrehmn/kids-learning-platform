"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fireConfetti } from "@/components/Confetti";

type WorldNavigationProps = {
  active?: "home" | "typing" | "english";
};

const destinations = [
  { label: "Home", href: "/", key: "home", icon: "⌂" },
  { label: "Typing", href: "/typing", key: "typing", icon: "⌨" },
  { label: "English", href: "/#english-zone", key: "english", icon: "▣" },
  { label: "Games", href: "/#games", key: "games", icon: "✣" },
  { label: "Rewards", href: "/#rewards", key: "rewards", icon: "♜" },
] as const;

function BrandStar() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="space-brand-star">
      <path d="m24 3.5 5.9 12 13.2 1.9-9.55 9.3 2.25 13.15L24 33.65l-11.8 6.2 2.25-13.15-9.55-9.3 13.2-1.9L24 3.5Z" fill="url(#brand-star-fill)" stroke="#ffc64b" strokeWidth="2" strokeLinejoin="round" />
      <defs><linearGradient id="brand-star-fill" x1="12" y1="5" x2="34" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#fff47a" /><stop offset="1" stopColor="#ffb52e" /></linearGradient></defs>
      <circle cx="20" cy="22" r="1.4" fill="#704293" /><circle cx="28" cy="22" r="1.4" fill="#704293" />
      <path d="M20.5 27c2.1 2 4.9 2 7 0" fill="none" stroke="#704293" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function WorldNavigation({ active = "home" }: WorldNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const desktopLayout = window.matchMedia("(min-width: 701px)");
    const closeMenuOnDesktop = () => {
      if (desktopLayout.matches) setIsMenuOpen(false);
    };

    desktopLayout.addEventListener("change", closeMenuOnDesktop);
    return () => desktopLayout.removeEventListener("change", closeMenuOnDesktop);
  }, []);

  return (
    <header className="space-header-wrap">
      <div
        className={`space-header${isMenuOpen ? " is-menu-open" : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape" && isMenuOpen) {
            setIsMenuOpen(false);
            menuButtonRef.current?.focus();
          }
        }}
      >
        <Link href="/" className="space-brand" aria-label="KiddoWorld home" onClick={() => setIsMenuOpen(false)}>
          <BrandStar />
          <span className="space-brand-copy">
            <span className="space-brand-name">Kiddo<span>World</span></span>
            <span className="space-brand-tagline">Learn · Type · Play · Grow</span>
          </span>
        </Link>

        <button
          ref={menuButtonRef}
          type="button"
          className="space-menu-toggle"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="kiddo-main-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="space-menu-toggle-icon" aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
          <span>{isMenuOpen ? "Close" : "Menu"}</span>
        </button>

        <nav id="kiddo-main-navigation" className="space-navigation" aria-label="Main navigation">
          {destinations.map((destination) => (
            <Link
              key={destination.key}
              href={destination.href}
              className={`space-nav-link${active === destination.key ? " is-active" : ""}`}
              aria-current={active === destination.key ? "page" : undefined}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="space-nav-icon" aria-hidden="true">{destination.icon}</span>
              <span>{destination.label}</span>
            </Link>
          ))}
        </nav>

        <Link
          href={active === "typing" ? "#typing-practice" : "/typing"}
          className="space-header-cta"
          onClick={(event) => {
            setIsMenuOpen(false);
            const bounds = event.currentTarget.getBoundingClientRect();
            fireConfetti(
              event.clientX || bounds.left + bounds.width / 2,
              event.clientY || bounds.top + bounds.height / 2,
              18,
            );
          }}
        >
          <span className="space-cta-rocket" aria-hidden="true">↗</span>
          {active === "typing" ? "Start typing" : "Start learning"}
        </Link>
      </div>
    </header>
  );
}
