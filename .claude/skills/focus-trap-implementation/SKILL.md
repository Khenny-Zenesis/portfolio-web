---
name: focus-trap-implementation
description: Use when building any modal, dialog, or fixed open/close panel. Triggers include delete confirmation modal, chat widget panel, focus trap, keyboard navigation, modal, dialog.
---

# focus-trap-implementation

Teaches the actual technique for trapping keyboard focus. Law lives in PRD.md Section 7E (accessibility — chat widget and delete confirmation modal must trap focus) and AGENTS.md accessibility rules.

## Steps

1. On open, store a reference to the element that had focus immediately before opening.
2. Move focus to the first focusable element inside the panel or modal.
3. Identify every focusable element inside the container — buttons, links, inputs.
4. On Tab from the last focusable element, cycle to the first. On Shift+Tab from the first, cycle to the last. Focus never leaves the container while it's open.
5. Listen for the Escape key. Close the panel or modal on press.
6. On close — by Escape, backdrop click, or an action button — restore focus to the element saved in step 1.

## Code skeleton

```typescript
function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isOpen: boolean) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    previouslyFocused.current = document.activeElement as HTMLElement;

    const focusable = containerRef.current.querySelectorAll<HTMLElement>(
      'button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { /* trigger close */ }
      if (e.key !== "Tab") return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus(); // restore on close
    };
  }, [isOpen]);
}
```

## Traps

- Handling Tab but forgetting Shift+Tab, so reverse-cycling escapes the container.
- Moving focus in on open but never restoring it on close.
- Trapping focus but forgetting Escape closes the panel.
- Applying this to the delete modal and forgetting the chat widget panel needs the identical treatment.

## Verify before done

- Open the delete confirmation modal using only the keyboard. Tab through it and confirm focus never lands on something behind the modal.
- Press Shift+Tab from the first focusable element — confirm it wraps to the last.
- Press Escape — confirm the modal closes and focus returns to the triggering button.
- Repeat all three checks on the chat widget panel.
- Tests to write: a test simulating Tab past the last element asserting focus wraps to the first; a test simulating Escape asserting the panel closes; a test asserting focus returns to the trigger element on close.