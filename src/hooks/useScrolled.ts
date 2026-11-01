"use client";

import { type RefObject, useEffect, useState } from "react";

export interface UseScrolledOptions {
  /** Scroll distance in pixels after which `scrolled` becomes true. */
  threshold?: number;
}

/**
 * Returns `true` once the nearest scrollable ancestor of `targetRef` has been
 * scrolled past `threshold` pixels.
 *
 * Apps that scroll inside a container (e.g. an `overflow-y-auto` shell) never
 * move `window.scrollY`, so the hook walks up from the target to find the
 * element that actually scrolls and listens there, falling back to `window`.
 * Use it on a sticky element (header, toolbar) to switch to a solid background
 * once content scrolls underneath it.
 */
export function useScrolled(
  targetRef: RefObject<HTMLElement | null>,
  { threshold = 24 }: UseScrolledOptions = {},
) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scrollParent = getScrollParent(targetRef.current);
    const target = scrollParent as EventTarget;

    const getScrollTop = () =>
      scrollParent === window
        ? window.scrollY || document.documentElement.scrollTop
        : (scrollParent as HTMLElement).scrollTop;

    const update = () => {
      setScrolled(getScrollTop() > threshold);
    };

    update();
    target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      target.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetRef, threshold]);

  return scrolled;
}

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  let el = node?.parentElement ?? null;

  while (el) {
    const { overflowY } = window.getComputedStyle(el);
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "overlay"
    ) {
      return el;
    }
    el = el.parentElement;
  }

  return window;
}

export default useScrolled;

