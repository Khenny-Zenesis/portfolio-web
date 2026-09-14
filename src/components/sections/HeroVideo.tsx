"use client";

import { useEffect, useRef, useState } from "react";

// Split out from Hero.tsx as its own small client component only because it
// needs interactive state (the mute toggle) — Hero itself stays a Server
// Component otherwise, same composition pattern as Reveal elsewhere.
//
// No wrapping div/border of its own anymore — Hero.tsx's own container
// provides the rounded, overflow-hidden frame now that the video is the
// full-bleed hero visual, not a small card. w-full h-full + object-cover
// fill whatever size that parent gives it.
//
// Self-healing: if /kehinde-intro.mp4 is missing (deleted, renamed, not yet
// replaced), falls back to the same "pending" placeholder pattern used
// elsewhere in this project, instead of a browser's broken-video icon.
// Means this file doesn't need hand-editing every time the video does or
// doesn't exist — swap in a real file at this path and it just plays.
//
// The error listener is attached natively via useEffect, not React's
// onError JSX prop — verified live that the JSX prop genuinely does not
// fire reliably for <video> load failures (confirmed via the DOM directly:
// video.error was set, but the onError handler never ran). This is a real,
// observed gap in React's synthetic event handling for media elements, not
// a style preference.
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Already failed before this effect even attached (e.g. cached error
    // from a prior mount) — check once up front, then also listen for it
    // happening from here on.
    if (video.error) {
      setErrored(true);
      return;
    }

    const handleError = () => setErrored(true);
    video.addEventListener("error", handleError);
    return () => video.removeEventListener("error", handleError);
  }, []);

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  if (errored) {
    return (
      <div
        role="img"
        aria-label="Placeholder for an intro video — real video not yet provided"
        style={{
          borderColor: "var(--color-border-accent)",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-primary)",
        }}
        className="flex h-full w-full items-center justify-center border border-dashed p-6 text-center"
      >
        Video pending — add public/kehinde-intro.mp4
      </div>
    );
  }

  return (
    <>
      <video
        ref={videoRef}
        src="/kehinde-intro.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute video" : "Mute video"}
        style={{
          position: "absolute",
          bottom: "var(--space-4)",
          right: "var(--space-4)",
          zIndex: 2,
          borderRadius: "var(--radius-md)",
          background: "var(--color-bg-primary)",
          color: "var(--color-text-primary)",
          padding: "var(--space-2) var(--space-3)",
        }}
        className="text-sm"
      >
        {muted ? "Unmute" : "Mute"}
      </button>
    </>
  );
}
