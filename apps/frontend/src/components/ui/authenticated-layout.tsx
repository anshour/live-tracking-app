import React from "react";
import { TrackerContextProvider } from "~/context";
import { useAuthGuard } from "~/hooks";

export const AuthenticatedLayout = ({ children }: React.PropsWithChildren) => {
  const { isLoading, isRedirecting } = useAuthGuard();

  if (isLoading) {
    return <div>Please wait...</div>;
  }

  if (isRedirecting) {
    return <div>Redirecting...</div>;
  }

  return <TrackerContextProvider>{children}</TrackerContextProvider>;
};
