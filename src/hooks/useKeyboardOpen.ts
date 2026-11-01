"use client";

import { useEffect, useState } from "react";

// Even small on-screen keyboards are taller than this. Address-bar and
// browser-chrome changes stay below the threshold.
const MIN_KEYBOARD_HEIGHT = 140;

// How long a predicted state is trusted before the viewport must confirm it.
// Keyboards finish animating well within this; if the viewport still disagrees
// afterwards (e.g. a hardware keyboard is attached), the measurement wins.
const PREDICTION_WINDOW_MS = 800;

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
 * Returns true while the on-screen keyboard is open.
 *
 * Browsers only report the keyboard through viewport resize events, which
 * usually arrive once the keyboard has finished sliding in. Waiting for them
 * makes any keyboard-driven animation lag behind. So:
 *
 *  - A finished tap on a text field *predicts* "open" immediately, and moving focus off
 *    every text field predicts "closed", so animations run alongside the
 *    keyboard instead of after it.
 *  - The viewport measurement then confirms the prediction. Disagreeing
 *    measurements are ignored for a short window (the keyboard is still in
 *    flight), after which the measurement is authoritative again.
 *
 * Programmatic focus (e.g. `autoFocus` on page load) does not predict
 * anything, because mobile browsers do not open the keyboard for it.
 *
 * The measurement combines:
 *  - `visualViewport.height`, which shrinks when the keyboard overlays the
 *    page (iOS, or `interactive-widget=overlays-content`).
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
    let prediction: { open: boolean; until: number } | null = null;
    let frame = 0;
    let settleTimer = 0;
    let focusTimer = 0;

    const commit = (next: boolean) => {
      if (next === open) return;
      open = next;
      setIsOpen(next);
    };

    const measure = () => {
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

    const sync = () => {
      const measured = measure();
      if (prediction) {
        if (
          measured !== prediction.open &&
          performance.now() < prediction.until
        ) {
          return;
        }
        prediction = null;
      }
      commit(measured);
    };

    const scheduleSync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };

    const predict = (next: boolean) => {
      if (next === open) return;
      prediction = {
        open: next,
        until: performance.now() + PREDICTION_WINDOW_MS,
      };
      commit(next);
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(sync, PREDICTION_WINDOW_MS + 16);
    };

    // Predict on `click`, not `pointerdown`: on touch screens focus and the
    // click are only dispatched when the finger lifts. Starting the layout
    // animation at touch-down moves the field out from under the finger, so
    // the tap lands on something else and the field never gets the cursor.
    const onClick = (event: MouseEvent) => {
      if ((event as PointerEvent).pointerType === "mouse") return;
      const target = event.target instanceof Element ? event.target : null;
      // Taps on a wrapping <label> focus its control.
      const field = target?.closest("label")?.control ?? target;
      if (isEditable(field)) predict(true);
    };

    const onFocusOut = () => {
      // Focus may just be moving to another field (e.g. the next OTP box);
      // decide once it has landed.
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(() => {
        if (!isEditable(document.activeElement)) predict(false);
      }, 0);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("focusout", onFocusOut, true);
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("orientationchange", scheduleSync);
    vv?.addEventListener("resize", scheduleSync);
    vv?.addEventListener("scroll", scheduleSync);

    sync();

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.clearTimeout(focusTimer);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("focusout", onFocusOut, true);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("orientationchange", scheduleSync);
      vv?.removeEventListener("resize", scheduleSync);
      vv?.removeEventListener("scroll", scheduleSync);
    };
  }, []);

  return isOpen;
}
