"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Shared scroll-reveal wrapper: fades/slides content up as it enters the
// viewport, via the native IntersectionObserver API (no animation library —
// "CSS-only, no new dependencies" is honored by doing the actual animation
// in CSS transitions in globals.css; this component only toggles a class).
//
// A Server Component can still render this as a child without itself
// becoming a Client Component — only Reveal's own wrapper div needs the
// browser APIs, the content inside stays server-rendered.
//
// prefers-reduced-motion is checked twice, deliberately: here (skip the
// observer, render already-visible) and again in globals.css's media query
// (in case this runs before the check, or JS never runs at all) — belt and
// suspenders for the WCAG 2.1 AA requirement.
export default function Reveal({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Deliberate exception to react-hooks/set-state-in-effect: this
      // mirrors a browser-only media-query preference into state on mount.
      // A lazy useState(() => matchMedia(...)) initializer would read
      // `window` during the client's hydration pass but not during SSR
      // (where it's undefined), producing a genuine server/client
      // hydration mismatch — strictly worse than this one intentional
      // synchronous setState.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={style}
      className={`reveal${visible ? " reveal-visible" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
