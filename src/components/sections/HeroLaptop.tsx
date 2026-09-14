"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

// Corners of the laptop's screen area within provly-laptop-mockup.png
// (1515×1038 — a 3D-angled laptop render, so the screen is a quadrilateral,
// not an axis-aligned rectangle): top-left, top-right, bottom-right,
// bottom-left, as fractions of the image's own width/height.
//
// Measured programmatically, not by eye: a Playwright script drew the real
// PNG to an in-page <canvas>, read pixel brightness, and traced each edge
// (top/right/bottom/left) by scanning for the white-screen/black-bezel
// boundary (screen ~(249,247,244), bezel ~(0,0,0) — a huge, reliable
// contrast). An earlier hand-eyeballed-off-a-grid-screenshot estimate had
// the top-right corner ~7% too far right (0.592 vs the true ~0.52) — small
// enough to look plausible on a grid overlay, but large enough that the
// video overshot the bezel on the right side, confirmed via a magenta
// debug-overlay screenshot before this measurement replaced it.
const SCREEN = {
  tl: [0.123, 0.263] as const,
  tr: [0.52, 0.177] as const,
  br: [0.605, 0.57] as const,
  bl: [0.232, 0.685] as const,
};

// ---------------------------------------------------------------------------
// Perspective warp — maps the video's own rectangle onto the screen's
// quadrilateral with true projective (keystone) distortion, so horizontal
// lines in the video actually converge toward the laptop's vanishing point
// instead of just being cropped into a quad's outline. Per explicit request
// ("that level of polish"), replacing the earlier flat clip-path-only crop
// (documented in git history) which read as "video cropped into the screen"
// rather than fused with the 3D render.
//
// This is the standard "CSS corner-pin" homography technique (source: Paul
// Heckbert's 1989 thesis on general quadrilateral texture mapping, widely
// republished as a browser-only, library-free CSS recipe): solve for the
// 3x3 projective matrix that sends the unit square to an arbitrary
// quadrilateral, do that twice (once for the source rectangle, once for the
// destination quad) and combine them, then embed the result in a CSS
// matrix3d(). No `perspective` CSS property is needed on a parent — this
// specific matrix is a self-contained projective transform.
type Mat3 = number[]; // row-major 3x3

function adjugate(m: Mat3): Mat3 {
  return [
    m[4] * m[8] - m[5] * m[7],
    m[2] * m[7] - m[1] * m[8],
    m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8],
    m[0] * m[8] - m[2] * m[6],
    m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6],
    m[1] * m[6] - m[0] * m[7],
    m[0] * m[4] - m[1] * m[3],
  ];
}

function multiplyMat3(a: Mat3, b: Mat3): Mat3 {
  const c = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) sum += a[3 * i + k] * b[3 * k + j];
      c[3 * i + j] = sum;
    }
  }
  return c;
}

function multiplyMat3Vec(m: Mat3, v: [number, number, number]): [number, number, number] {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

// Solves for the 3x3 matrix mapping the unit square (0,0) (1,0) (0,1) (1,1)
// onto the four given points (in the order top-left, top-right, bottom-left,
// bottom-right — NOT clockwise; this order is what makes the linear algebra
// below work out, per the source technique).
function squareToQuad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): Mat3 {
  const m: Mat3 = [x1, x2, x3, y1, y2, y3, 1, 1, 1];
  const v = multiplyMat3Vec(adjugate(m), [x4, y4, 1]);
  return multiplyMat3(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
}

// Full mapping: source rectangle (0,0)-(w,h) onto an arbitrary destination
// quad, both given as top-left/top-right/bottom-left/bottom-right points.
function rectToQuadMatrix3d(
  w: number,
  h: number,
  dest: { tl: [number, number]; tr: [number, number]; bl: [number, number]; br: [number, number] }
): string {
  const s = squareToQuad(0, 0, w, 0, 0, h, w, h);
  const d = squareToQuad(dest.tl[0], dest.tl[1], dest.tr[0], dest.tr[1], dest.bl[0], dest.bl[1], dest.br[0], dest.br[1]);
  const t = multiplyMat3(d, adjugate(s));
  for (let i = 0; i < 9; i++) t[i] /= t[8];
  // Row-major 3x3 -> CSS matrix3d's column-major 4x4, per the standard
  // 2D-projective-transform-as-3D-matrix embedding.
  const m = [
    t[0], t[3], 0, t[6],
    t[1], t[4], 0, t[7],
    0, 0, 1, 0,
    t[2], t[5], 0, t[8],
  ];
  return `matrix3d(${m.join(", ")})`;
}

// Static image shown first (dashboard mockup + a baked-in play button,
// already part of the PNG); clicking anywhere over that play button starts
// the real video, autoplaying from that point — the click itself is the
// user gesture, so it can autoplay with sound rather than needing to start
// muted the way true page-load autoplay does.
//
// The video is layered ON TOP of the laptop image (not punched through a
// hole in it) — an earlier version tried an SVG clipPath "hole" (evenodd,
// two subpaths) referenced via clip-path: url(#id) on the <Image>, verified
// via Playwright to render as a plain axis-aligned rectangle instead of the
// screen's actual quadrilateral shape, a real Chromium limitation for
// clip-path/mask referencing SVG geometry on HTML (non-SVG) elements, not a
// coordinate error. Now that the video is warped to the screen's exact
// shape via matrix3d (see above), it fills that shape itself — no
// clip-path needed at all, the transformed rectangle's own edges are the
// screen's edges.
export default function HeroLaptop() {
  const [playing, setPlaying] = useState(false);
  const [matrix, setMatrix] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const recomputeMatrix = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    setMatrix(
      rectToQuadMatrix3d(width, height, {
        tl: [SCREEN.tl[0] * width, SCREEN.tl[1] * height],
        tr: [SCREEN.tr[0] * width, SCREEN.tr[1] * height],
        br: [SCREEN.br[0] * width, SCREEN.br[1] * height],
        bl: [SCREEN.bl[0] * width, SCREEN.bl[1] * height],
      })
    );
  }, []);

  const handlePlay = useCallback(() => {
    recomputeMatrix();
    setPlaying(true);
  }, [recomputeMatrix]);

  // Recompute on resize/orientation-change while playing, so the warp stays
  // pinned to the screen's shape at any viewport width rather than only the
  // width it happened to be measured at on click.
  useEffect(() => {
    if (!playing) return;
    window.addEventListener("resize", recomputeMatrix);
    return () => window.removeEventListener("resize", recomputeMatrix);
  }, [playing, recomputeMatrix]);

  return (
    // isolation: isolate scopes the overlay's mix-blend-mode below to this
    // component's own stacking context — without it, "blend with whatever
    // is painted behind me" would reach past the Image to the page behind
    // this whole component too (harmless here since that's also near-black,
    // but not correctly scoped), and more importantly keeps the boundary
    // predictable as this file changes.
    <div ref={containerRef} className="relative w-full" style={{ aspectRatio: "1515 / 1038", isolation: "isolate" }}>
      <Image
        src="/provly-laptop-mockup.png"
        alt="Provly dashboard shown on a laptop"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 1200px"
        className="object-cover"
      />

      {/* Lightens the mockup's own near-black background/bezel (baked into
          the PNG, so a container background-color alone can never show
          through an object-cover image that fully covers it — the
          wrapping div's background swap to --color-bg-elevated in Hero.tsx
          had no visible effect for exactly that reason). mix-blend-mode:
          screen against an opaque --color-bg-elevated layer lifts pure
          black up to that token's exact value while leaving the dashboard's
          white content untouched — Screen(1, C) == 1 regardless of C, this
          is standard blend-mode math, not a guess.
          Always rendered, playing or not: the bezel/keyboard/canvas this
          lightens is the same static image in both states (only the screen
          area gets covered by the video), so hiding it while playing (an
          earlier version of this) incorrectly made the surroundings snap
          back to pure black the moment the video started. It's painted
          directly after the Image and before the video, so the video (an
          opaque element painted on top of it) is never itself blended —
          only what's actually behind this layer is. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "var(--color-bg-elevated)", mixBlendMode: "screen", pointerEvents: "none" }}
      />

      {playing && matrix && (
        <video
          src="/kehinde-intro.mp4"
          autoPlay
          loop
          controls
          className="absolute h-full w-full object-cover"
          style={{ top: 0, left: 0, transformOrigin: "0 0", transform: matrix }}
        />
      )}

      {!playing && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label="Play intro video"
          style={{
            position: "absolute",
            left: "42%",
            top: "31%",
            width: "13%",
            height: "17%",
            cursor: "pointer",
          }}
        />
      )}
    </div>
  );
}
