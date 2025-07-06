import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuthData } from "~/context/auth-context";

export const useAuthGuard = (redirectPath: string = "/login") => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthData();

  const isRedirecting = !isLoading && !isAuthenticated;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, redirectPath]);

  return { isAuthenticated, isLoading, isRedirecting };
};
