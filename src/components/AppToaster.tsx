"use client";

import { CircleAlert, CircleCheck, Info, LoaderCircle, X } from "lucide-react";
import {
  type Toast,
  ToastBar,
  Toaster,
  resolveValue,
  toast as toastApi,
} from "react-hot-toast";
import { cn } from "@/utils/cn";

const ICON_BADGE: Record<Toast["type"], string> = {
  success: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  error: "bg-red-50 text-red-600 ring-red-100",
  loading: "bg-violet-50 text-brand-900 ring-violet-100",
  blank: "bg-indigo-50 text-brand-ink ring-indigo-100",
  custom: "bg-indigo-50 text-brand-ink ring-indigo-100",
};

const ToastIcon = ({ type }: { type: Toast["type"] }) => {
  const className = "size-[18px]";
  switch (type) {
    case "success":
      return <CircleCheck className={className} strokeWidth={2.25} />;
    case "error":
      return <CircleAlert className={className} strokeWidth={2.25} />;
    case "loading":
      return (
        <LoaderCircle
          className={cn(className, "animate-spin")}
          strokeWidth={2.25}
        />
      );
    default:
      return <Info className={className} strokeWidth={2.25} />;
  }
};

/**
 * App-wide toast host in the new UI style: a white rounded card with a soft
 * purple shadow, a tinted icon badge per type and a dismiss button.
 *
 * Used by both the pages router (`_app.tsx`) and the app router
 * (`app/providers.tsx`); every `toast.success/error/...` call picks it up.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      containerStyle={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      toastOptions={{
        duration: 4000,
        success: { duration: 3000 },
        error: { duration: 5000 },
      }}
    >
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            // The card below carries all the visuals.
            padding: 0,
            background: "transparent",
            boxShadow: "none",
            borderRadius: 0,
            maxWidth: "min(420px, calc(100vw - 32px))",
          }}
        >
          {() => (
            <div
              className={cn(
                "flex w-[min(400px,calc(100vw-32px))] items-center gap-3 rounded-2xl border border-white bg-white/95 py-2.5 pr-2 pl-2.5 text-brand-ink backdrop-blur",
                "shadow-[0_18px_40px_-16px_rgba(76,29,149,0.45)] ring-1 ring-brand-900/5",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full ring-1",
                  ICON_BADGE[t.type],
                )}
              >
                <ToastIcon type={t.type} />
              </span>
              {/* Rendered directly (not via ToastBar's `message`, whose built-in
                  styles centre the text and add margins), keeping its
                  role/aria-live attributes for screen readers. */}
              <div
                {...t.ariaProps}
                className="min-w-0 flex-1 text-left text-[15px] leading-snug font-semibold whitespace-pre-line"
              >
                {resolveValue(t.message, t)}
              </div>
              {t.type !== "loading" && (
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => toastApi.dismiss(t.id)}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}

export default AppToaster;
