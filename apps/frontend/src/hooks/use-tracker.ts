import { Tracker, TrackerHistory } from "@livetracking/shared";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useErrorHandler } from "./use-error-handler";
import { queryKeys } from "~/constants";
import { http } from "~/utils";

export const useFetchTrackers = () => {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: queryKeys.trackers,
    queryFn: () => http.get<Tracker[]>("/trackers"),
    placeholderData: keepPreviousData,
    throwOnError: (error: Error) => {
      handleError(error);
      return false;
    },
  });

  const trackers = query.data?.data || [];

  return { trackers, ...query };
};

export const useFetchTrackerHistory = (id: string) => {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: queryKeys.trackerHistories(id),
    queryFn: () => http.get<TrackerHistory[]>(`/trackers/${id}/histories`),
    placeholderData: keepPreviousData,
    enabled: !!id,
    throwOnError: (error: Error) => {
      handleError(error);
      return false;
    },
  });

  const histories = query.data?.data || [];

  return { histories, ...query };
};

export const useStartSimulation = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  const mutation = useMutation({
    mutationFn: () => http.post("/trackers/simulation/start"),
    onError: handleError,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.simulationStatus,
      });
    },
  });

  return mutation;
};

export const useStopSimulation = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  const mutation = useMutation({
    mutationFn: () => http.post("/trackers/simulation/stop"),
    onError: handleError,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.simulationStatus,
      });
    },
  });

  return mutation;
};

export const useFetchSimulationStatus = () => {
  const { handleError } = useErrorHandler();

  const query = useQuery({
    queryKey: queryKeys.simulationStatus,
    queryFn: () =>
      http.get<{ isActive: boolean }>("/trackers/simulation/status"),
    placeholderData: keepPreviousData,
    throwOnError: (error: Error) => {
      handleError(error);
      return false;
    },
  });

  const simulationStatus = query.data?.data.isActive || false;

  return { simulationStatus, ...query };
};
