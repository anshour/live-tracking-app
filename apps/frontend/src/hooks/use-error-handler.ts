import { AxiosError, isAxiosError } from "axios";
import toast from "react-hot-toast";

export const useErrorHandler = () => {
  const handleError = (error: Error | AxiosError<{ message: string }>) => {
    if (error instanceof Error && !isAxiosError(error)) {
      toast.error(error.message || "An unexpected error occurred");
      return;
    }

    if (!navigator.onLine) {
      toast.error("Please check your internet connection");
      return;
    }

    if (error.response?.status === 500) {
      toast.error(
        "Sorry, there was a technical error. Please contact admin. Error code: 500"
      );
      return;
    }

    toast.error(
      error.response?.data?.message || "An unexpected error occurred"
    );
  };

  return { handleError };
};
