"use client";

import { useEffect, useState } from "react";

// Even small on-screen keyboards are taller than this. Address-bar and
// browser-chrome changes stay below the threshold.
const MIN_KEYBOARD_HEIGHT = 140;

/**
 * Returns true only while the on-screen keyboard is actually covering part of
 * the viewport — focus alone never opens the animation.
 *
 * Two measurements are combined:
 *  - `visualViewport.height` shrinks when the keyboard overlays the page
 *    (iOS, or `interactive-widget=overlays-content`).
 *  - `window.innerHeight` shrinks when the keyboard resizes the layout
 *    viewport (`interactive-widget=resizes-content`, Android default with the
 *    meta tag this app sets).
 */
export function useKeyboardOpen() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const vv = window.visualViewport;
    const root = document.documentElement;
    const hasTouchInput =
      window.matchMedia("(pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0;

    if (!hasTouchInput) return;

    // Largest layout height seen while the keyboard was closed. It is the
    // reference for browsers that resize the layout viewport.
    let layoutHeight = window.innerHeight;
    let width = window.innerWidth;

    const update = () => {
      // Orientation flips change both dimensions; re-baseline instead of
      // mistaking the shorter side for a keyboard.
      if (Math.abs(window.innerWidth - width) > 2) {
        width = window.innerWidth;
        layoutHeight = window.innerHeight;
        setIsOpen(false);
        return;
      }

      // The viewport only grows when the keyboard is gone, so keep the
      // tallest value as the closed reference.
      if (window.innerHeight >= layoutHeight) {
        layoutHeight = window.innerHeight;
      }

      // Ignore the overlay measurement while pinch-zoomed, where the visual
      // viewport shrinks without a keyboard being present.
      const overlayKeyboard =
        vv && vv.scale <= 1.01 ? root.clientHeight - vv.height : 0;
      const resizeKeyboard = layoutHeight - window.innerHeight;
      const hidden = Math.max(overlayKeyboard, resizeKeyboard);

      setIsOpen(hidden > MIN_KEYBOARD_HEIGHT);
    };

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);

    update();

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
    };
  }, []);

  return isOpen;
}

