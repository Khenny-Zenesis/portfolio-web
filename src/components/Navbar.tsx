"use client";

import { useState } from "react";
import Link from "next/link";

// New site-wide nav — wasn't part of the original spec, added per your
// request for an "About Me" link that carries visitors to that section.
// Fixed at top; page.tsx (and about/page.tsx, projects/page.tsx) add
// matching top padding so it never covers content.
//
// About and Projects both live at real, separate routes (/about,
// /projects), not anchors on the homepage — reached only by clicking these
// links, never stumbled into by scrolling. Skills/Contact remain
// same-page anchors, so their links stay path-qualified (/#skills, not
// just #skills) so they still resolve correctly from any page, not just
// the homepage.
const LINKS = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Skills", href: "/#skills" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

export const NAVBAR_HEIGHT = "64px";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: NAVBAR_HEIGHT,
        // color-mix, not a hardcoded rgba — a semi-transparent tint of the
        // actual token color, so the backdrop-blur underneath has something
        // to show through, without ever writing a raw hex/rgb value here.
        background: "color-mix(in srgb, var(--color-bg-primary) 85%, transparent)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          height: "100%",
          paddingLeft: "var(--space-6)",
          paddingRight: "var(--space-6)",
        }}
        className="flex items-center justify-between"
      >
        <Link
          href="/"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
          className="text-lg font-semibold"
        >
          KO
        </Link>

        <div style={{ gap: "var(--space-8)" }} className="hidden md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
              className="text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          style={{ color: "var(--color-text-primary)", gap: "var(--space-1)" }}
          className="flex flex-col md:hidden"
        >
          <span style={{ width: "22px", height: "2px", background: "currentColor" }} />
          <span style={{ width: "22px", height: "2px", background: "currentColor" }} />
          <span style={{ width: "22px", height: "2px", background: "currentColor" }} />
        </button>
      </div>

      {open && (
        <div
          style={{
            background: "var(--color-bg-secondary)",
            borderTop: "1px solid var(--color-border)",
            padding: "var(--space-4) var(--space-6)",
            gap: "var(--space-4)",
          }}
          className="flex flex-col md:hidden"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ fontFamily: "var(--font-primary)", color: "var(--color-text-secondary)" }}
              className="text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
