import { ImCancelCircle } from "react-icons/im";
import type React from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /**
   * Which edge the sheet slides in from.
   * "bottom" (default): slides up from bottom with keyboard avoidance.
   * "top": slides down from top.
   */
  side?: "bottom" | "top";
  /**
   * Stacking level for nested bottom sheets.
   * Level 0 (default): z-[100] backdrop, z-[101] popup
   * Level 1: z-[150] backdrop, z-[151] popup
   */
  level?: number;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
  side = "bottom",
  level = 0,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);
  const titleId = useId();

  // shouldRender: DOM node exists (kept alive for exit animation)
  // isVisible: sheet is in open position (drives CSS translate)
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      // No body scroll lock — manipulating body position/overflow breaks
      // Telegram WebView and iOS WKWebView. The backdrop covers all touch
      // targets so background scroll is not a practical issue.
      const raf = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setShouldRender(false), 320);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // ── Keyboard avoidance (bottom sheets only) ───────────────────────────
  useEffect(() => {
    if (side !== "bottom" || !open) return;
    const vv = window.visualViewport;
    if (!vv) return;

    const scrollFocusedIntoView = () => {
      const focused = document.activeElement;
      if (focused && sheetRef.current?.contains(focused)) {
        setTimeout(() => {
          focused.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }, 50);
      }
    };

    const update = () => {
      if (!sheetRef.current) return;
      const keyboardHeight =
        window.innerHeight - vv.height - (vv.offsetTop ?? 0);
      if (keyboardHeight > 0) {
        // Constrain with both top and bottom so the sheet never
        // overshoots the screen — height becomes whatever fits.
        sheetRef.current.style.top = "16px";
        sheetRef.current.style.bottom = `${keyboardHeight}px`;
        sheetRef.current.style.maxHeight = "";
      } else {
        sheetRef.current.style.top = "";
        sheetRef.current.style.bottom = "";
        sheetRef.current.style.maxHeight = "";
      }
      scrollFocusedIntoView();
    };

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();

    const sheet = sheetRef.current;
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      if (sheet) {
        sheet.style.top = "";
        sheet.style.bottom = "";
        sheet.style.maxHeight = "";
      }
    };
  }, [open, side]);

  // ── Scroll focused input into view when user taps a field ─────────────
  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        // Wait for the keyboard to finish resizing, then scroll
        setTimeout(() => {
          target.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }, 150);
      }
    };

    sheet.addEventListener("focusin", onFocusIn);
    return () => sheet.removeEventListener("focusin", onFocusIn);
  }, [open]);

  // ── Touch swipe-to-dismiss (drag handle only) ─────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (dragStartY.current === null) return;
      const diff = e.touches[0].clientY - dragStartY.current;
      dragCurrentY.current =
        side === "top" ? Math.min(0, diff) : Math.max(0, diff);
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${dragCurrentY.current}px)`;
        sheetRef.current.style.transition = "none";
      }
    },
    [side],
  );

  const handleTouchEnd = useCallback(() => {
    const dismissed =
      side === "top" ? dragCurrentY.current < -100 : dragCurrentY.current > 100;
    if (dismissed) {
      if (sheetRef.current) {
        sheetRef.current.style.transition = "transform 300ms ease-out";
        sheetRef.current.style.transform =
          side === "top" ? "translateY(-100%)" : "translateY(100%)";
      }
      onClose();
    } else if (sheetRef.current) {
      sheetRef.current.style.transition = "";
      sheetRef.current.style.transform = "";
    }
    dragStartY.current = null;
    dragCurrentY.current = 0;
  }, [onClose, side]);

  if (!shouldRender || typeof document === "undefined") return null;

  const backdropZ = 100 + level * 50;
  const popupZ = backdropZ + 1;

  const translateClass = isVisible
    ? "translate-y-0"
    : side === "top"
      ? "-translate-y-full"
      : "translate-y-full";

  const popupClass = [
    "fixed left-0 right-0 flex flex-col bg-card overflow-hidden",
    "transition-[transform,bottom,max-height] duration-300 ease-out",
    side === "top"
      ? "top-0 rounded-b-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
      : "bottom-0 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)]",
    translateClass,
  ].join(" ");

  return createPortal(
    <>
      {/* Backdrop — click outside to close */}
      <div
        className={[
          "fixed inset-0 bg-black/50 backdrop-blur-md",
          "transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{ zIndex: backdropZ }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={popupClass}
        style={{ maxHeight: "85svh", zIndex: popupZ }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {/* Drag handle — touch handlers only here */}
        <div
          className="flex justify-center py-2 touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-border px-4 pb-3">
            <h2
              id={titleId}
              className="text-base font-semibold text-foreground"
            >
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted/50"
            >
              <ImCancelCircle size={20} aria-hidden="true" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-0 pb-2">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border px-4 py-3">{footer}</div>
        )}
      </div>
    </>,
    document.body,
  );
}
