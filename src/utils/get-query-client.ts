import { QueryClient, isServer } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 20 * 1000,
        retry(_failureCount, error) {
          if (error instanceof AxiosError) {
            toast.error(error.response?.data?.error);
          } else if (error instanceof Error) {
            toast.error(error.message);
          }
          return false;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
