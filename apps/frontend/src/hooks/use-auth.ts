import { useMutation, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { http } from "~/utils";
import { useErrorHandler } from "./use-error-handler";
import { User } from "@livetracking/shared";
import { queryKeys } from "~/constants";

export const useLogin = () => {
  const { handleError } = useErrorHandler();
  const mutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      http.post<any>("/auth/login", data),
    throwOnError: false,
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 401) {
        toast.error("Invalid email or password. Please try again.");
        return;
      }

      handleError(error);
    },
  });

  return mutation;
};

export const useRegister = () => {
  const { handleError } = useErrorHandler();
  const mutation = useMutation({
    mutationFn: (data: any) => http.post<any>("/auth/register", data),
    throwOnError: false,
    onError: handleError,
  });

  return mutation;
};

export const useFetchProfile = () => {
  const query = useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => http.get<User>("/auth/profile"),
    throwOnError: false,
  });

  return query;
};
