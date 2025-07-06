import { QueryClientConfig } from "@tanstack/react-query";


export const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      networkMode: "always",
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      networkMode: "always",
      retry: false,
    },
  },
};
