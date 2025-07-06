import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@livetracking/shared";
import { useFetchProfile } from "~/hooks";

export type AuthData = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
};

export const AuthContext = createContext<AuthData>({
  isAuthenticated: false,
  isLoading: false,
  user: null,
});

export const AuthProvider = (props: any) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const fetcher = useFetchProfile();

  useEffect(() => {
    if (fetcher.isSuccess) {
      setUser({
        id: fetcher.data.data.id,
        name: fetcher.data.data.name,
        email: fetcher.data.data.email,
      });
      setIsAuthenticated(true);
      setIsLoading(false);
    }

    if (fetcher.isError) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [fetcher.data, fetcher.isError, fetcher.isSuccess]);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user }}
      {...props}
    />
  );
};

export const useAuthData = (): AuthData => useContext(AuthContext);
