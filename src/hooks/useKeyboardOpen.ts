"use client";

import { useEffect, useState } from "react";

// Even small on-screen keyboards are taller than this. Address-bar and
// browser-chrome changes stay below the threshold.
const MIN_KEYBOARD_HEIGHT = 140;

const NON_TEXT_INPUTS = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "hidden",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

const isEditable = (el: Element | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  if (el instanceof HTMLTextAreaElement) return !el.readOnly && !el.disabled;
  if (el instanceof HTMLInputElement) {
    return !el.readOnly && !el.disabled && !NON_TEXT_INPUTS.has(el.type);
  }
  return false;
};

/**
 * Returns true while the on-screen keyboard is (or is about to be) open.
 *
 * Browsers only report the keyboard through viewport resizes, which arrive
 * once it has finished sliding in — on Android that can take well over half a
 * second. Waiting for them makes keyboard-driven animations lag, and timing
 * them out makes the UI bounce. Instead this follows the focused field:
 *
 *  - Tapping a text field reports "open" straight away (on `click`, i.e. after
 *    the finger lifts and focus has landed, so nothing moves mid-tap).
 *  - It stays open while a text field keeps focus, however long the keyboard
 *    takes to appear — there is no timeout to bounce back on.
 *  - It closes as soon as focus leaves every text field, or when the keyboard
 *    has been seen and is then dismissed while the field keeps focus (Android
 *    back button / iOS "Done").
 *  - A keyboard that opens without a tap (e.g. focus moved programmatically
 *    while it was already up) is picked up from the viewport measurement.
 *
 * Programmatic focus alone (e.g. `autoFocus` on page load) reports nothing,
 * because mobile browsers do not open the keyboard for it.
 *
 * The measurement combines:
 *  - `visualViewport.height`, which shrinks when the keyboard overlays the
 *    page (iOS, or Android's default `interactive-widget=resizes-visual`).
 *  - `window.innerHeight`, which shrinks when the keyboard resizes the layout
 *    viewport (`interactive-widget=resizes-content`, set by this app).
 */
export function useKeyboardOpen() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasTouchInput =
      window.matchMedia("(pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0;
    if (!hasTouchInput) return;

    const vv = window.visualViewport;
    const root = document.documentElement;

    // Largest layout height seen; the closed reference for browsers that
    // resize the layout viewport.
    let layoutHeight = window.innerHeight;
    let width = window.innerWidth;
    let open = false;
    // The user tapped the focused field, so a keyboard is on its way.
    let tapped = false;
    // The viewport has shown the keyboard during this focus session.
    let sawKeyboard = false;
    let frame = 0;
    let focusTimer = 0;

    const measureOpen = () => {
      // Orientation flips change both dimensions; re-baseline instead of
      // mistaking the shorter side for a keyboard.
      if (Math.abs(window.innerWidth - width) > 2) {
        width = window.innerWidth;
        layoutHeight = window.innerHeight;
      }
      if (window.innerHeight > layoutHeight) {
        layoutHeight = window.innerHeight;
      }
      // Pinch-zoom shrinks the visual viewport without a keyboard; ignore it.
      const overlay =
        vv && vv.scale <= 1.01 ? root.clientHeight - vv.height : 0;
      const resize = layoutHeight - window.innerHeight;
      return Math.max(overlay, resize) > MIN_KEYBOARD_HEIGHT;
    };

    const update = () => {
      let next: boolean;
      if (!isEditable(document.activeElement)) {
        // Nothing to type into, so the keyboard is gone or going.
        tapped = false;
        sawKeyboard = false;
        next = false;
      } else if (measureOpen()) {
        sawKeyboard = true;
        next = true;
      } else {
        // Keyboard not (yet) visible: still on its way after a tap, or
        // dismissed while the field kept focus.
        if (sawKeyboard) tapped = false;
        next = tapped && !sawKeyboard;
      }

      if (next !== open) {
        open = next;
        setIsOpen(next);
      }
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    // `click`, not `pointerdown`: on touch screens focus and the click are
    // only dispatched when the finger lifts. Moving the layout at touch-down
    // shifts the field out from under the finger, so the tap would miss.
    const onClick = (event: MouseEvent) => {
      if ((event as PointerEvent).pointerType === "mouse") return;
      const target = event.target instanceof Element ? event.target : null;
      // Taps on a wrapping <label> focus its control.
      const field = target?.closest("label")?.control ?? target;
      if (!isEditable(field)) return;

      tapped = true;
      sawKeyboard = false;
      update();
    };

    const onFocusOut = () => {
      // Focus may just be moving to another field (e.g. the next OTP box);
      // decide once it has landed.
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(update, 0);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("focusout", onFocusOut, true);
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("orientationchange", scheduleUpdate);
    vv?.addEventListener("resize", scheduleUpdate);
    vv?.addEventListener("scroll", scheduleUpdate);

    update();

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(focusTimer);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("focusout", onFocusOut, true);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("orientationchange", scheduleUpdate);
      vv?.removeEventListener("resize", scheduleUpdate);
      vv?.removeEventListener("scroll", scheduleUpdate);
    };
  }, []);

  return isOpen;
}
