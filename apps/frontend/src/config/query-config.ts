import { QueryClientConfig } from "@tanstack/react-query";

export const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      networkMode: "online",
      retry: 2,
    },
    mutations: {
      networkMode: "online",
      retry: 2,
    },
  },
};
