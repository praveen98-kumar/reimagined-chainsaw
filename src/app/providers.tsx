"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useLayoutEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { hydrateAuth, loadStoredAuth } from "@/redux/features/authSlice";
import { store } from "@/redux/store";
import { getQueryClient } from "@/utils/get-query-client";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();

  // The server renders with an empty auth state (it has no localStorage), so
  // the first client render must too. Load the stored session right after
  // hydration — a layout effect runs before any child's passive effect, so
  // effects and queries already see the logged-in user.
  useLayoutEffect(() => {
    if (!store.getState().auth.hydrated) {
      store.dispatch(hydrateAuth(loadStoredAuth()));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>{children}</Provider>

      <Toaster
        position="top-right"
        containerClassName="mt-16"
        toastOptions={{
          success: {
            style: {
              fontWeight: "bold",
              color: "white",
              background: "green",
            },
          },
          error: {
            style: {
              fontWeight: "bold",
              color: "white",
              background: "red",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
