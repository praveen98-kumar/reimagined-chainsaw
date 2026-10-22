"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { getQueryClient } from "@/utils/get-query-client";

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();
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
