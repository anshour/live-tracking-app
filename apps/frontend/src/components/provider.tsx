import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { PropsWithChildren, useState } from "react";
import { queryConfig, toastConfig } from "~/config";
import { AuthProvider } from "~/context/auth-context";

interface Props extends PropsWithChildren {
  dehydratedState: AppProps["pageProps"]["dehydratedState"];
}

export function Provider({ children, dehydratedState }: Props) {
  const [queryClient] = useState(() => new QueryClient(queryConfig));

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <AuthProvider>
          <Toaster toastOptions={toastConfig} />
          {children}
        </AuthProvider>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
