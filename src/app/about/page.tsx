import Navbar, { NAVBAR_HEIGHT } from "@/components/Navbar";
import About from "@/components/sections/About";

// Real, separate route — not an anchor-scroll section on the homepage.
// Per explicit request: About should only be reached by clicking the
// Navbar's "About" link, never encountered by scrolling, matching the
// Selina Turfus reference's actual behavior (separate pages per section,
// not one long scrollable page). Not in AGENTS.md Section 4's original
// tree — that spec predates this ask, same as the Navbar itself.
//
// Fully static (About's own content has no live data dependency), so
// this page can prerender normally — no force-dynamic needed here.
export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main
        style={{
          maxWidth: "1200px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "var(--space-6)",
          paddingRight: "var(--space-6)",
          paddingTop: NAVBAR_HEIGHT,
        }}
      >
        <About />
      </main>
    </>
  );
}
