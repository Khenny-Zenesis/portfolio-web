// Embeds the real, self-contained Provly prototype (public/provly-demo-autoplay.html)
// live, rather than converting it to video. It already autoplays a full
// walkthrough on a loop (login → dashboard → new job → capture → AI
// processing → report) with its own smooth CSS/JS animation, and hands
// control to a visitor if they tap it — genuinely stronger than any video
// export of the same thing would be: sharper, smaller (21KB vs. megabytes),
// and actually interactive.
//
// Not subject to design-system-rule.md's token/no-hardcoded-color rules —
// this is Provly's own separate embedded document, not a component of this
// site's own tree, the same way a screenshot image can contain any colors.
//
// Accessibility note, flagged not fully resolved: the autoplay loop runs
// ~21s per cycle, which falls under WCAG 2.2.2 (Pause, Stop, Hide) for
// auto-updating content lasting more than 5s. The prototype's own script
// already stops autoplay on the visitor's first tap, which partially
// addresses this, but there's no visible, advertised pause control before
// that — a fuller fix would add one, not done here since it wasn't asked.
export default function HeroPrototype() {
  return (
    <iframe
      src="/provly-demo-autoplay.html"
      title="Provly — interactive prototype demo"
      className="h-full w-full"
      style={{ border: "none" }}
    />
  );
}
