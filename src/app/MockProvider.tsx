"use client";

import { useEffect, useState } from "react";

export function MockProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(
    process.env.NEXT_PUBLIC_MOCK_API !== "true", // if not mocking, always ready
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MOCK_API !== "true") return;
    import("@/mocks/browser").then(({ worker }) => {
      worker.start({ onUnhandledFrame: "bypass" }).then(() => setReady(true));
    });
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
