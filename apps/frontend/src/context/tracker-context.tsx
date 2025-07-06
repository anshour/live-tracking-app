import { Tracker, TrackingEvents } from "@livetracking/shared";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { Socket, io } from "socket.io-client";
import { queryKeys } from "~/constants";
import { useFetchTrackers } from "~/hooks/use-tracker";

export type TrackerContextValue = {
  socket: Socket | null;
  trackers: Tracker[];
  selectedTracker: Tracker | null;
  setSelectedTracker: (tracker: Tracker | null) => void;
  subscribeTrackers: () => void;
  unsubscribeTrackers: () => void;
  status: "connected" | "disconnected" | "reconnecting";
};

export const TrackerContext = createContext<TrackerContextValue>({
  socket: null,
  trackers: [],
  selectedTracker: null,
  setSelectedTracker: (t: Tracker | null) => {},
  subscribeTrackers: () => {},
  unsubscribeTrackers: () => {},
  status: "disconnected",
});

export const TrackerContextProvider = (props: any) => {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const [status, setStatus] = useState<
    "connected" | "disconnected" | "reconnecting"
  >("disconnected");
  const { trackers: trackerData, refetch } = useFetchTrackers();

  const subscribeTrackers = useCallback(() => {
    if (socket) {
      socket.emit(TrackingEvents.TRACKER_SUBSCRIBE);
    }
  }, [socket]);

  const unsubscribeTrackers = useCallback(() => {
    if (socket) {
      socket.emit(TrackingEvents.TRACKER_UNSUBSCRIBE);
    }
  }, [socket]);

  const addOrUpdateTracker = useCallback(
    (tracker: Tracker) => {
      setSelectedTracker((prevSelected) => {
        if (prevSelected?.id === tracker.id) {
          console.log("Updating selected tracker:", tracker.id);

          // Update tracker history in the query cache
          queryClient.invalidateQueries({
            queryKey: queryKeys.trackerHistories(tracker.id),
          });

          return tracker;
        }
        return prevSelected;
      });

      setTrackers((prevTrackers) => {
        const index = prevTrackers.findIndex((t) => t.id === tracker.id);

        if (index !== -1) {
          return prevTrackers.map((t, i) =>
            i === index ? { ...t, ...tracker } : t
          );
        }

        return [...prevTrackers, tracker];
      });
    },
    [queryClient]
  );

  const removeTracker = useCallback((tracker: Tracker) => {
    setTrackers((prevTrackers) =>
      prevTrackers.filter((t) => t.id !== tracker.id)
    );
  }, []);

  const handleError = (error: any) => {
    console.error("WebSocket error:", error);
    toast.error("An error occurred while connecting to the WebSocket server.");
  };

  const handleException = (exception: any) => {
    if (exception?.status === 401) {
      toast.error("You are not authorized to access this resource.");
      return;
    }

    console.error("WebSocket exception:", exception);
  };

  useEffect(() => {
    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/socket`, {
      auth: {
        token: localStorage.getItem("token") || "",
      },
      autoConnect: true,
      reconnection: true,
    });

    newSocket.on("connect", () => {
      setStatus("connected");
      refetch();
      console.log("Connected to WebSocket server");
    });

    newSocket.on("disconnect", (reason) => {
      setStatus("disconnected");
      refetch();
      console.log(`Disconnected from WebSocket server. reason : ${reason}`);
    });

    newSocket.on("reconnect_attempt", () => {
      console.log("🔄 Reconnecting...");
      setStatus("reconnecting");
    });

    newSocket.on("reconnect", () => {
      console.log("✅ Reconnected");
      setStatus("connected");
    });

    newSocket.on("reconnect_error", (err) => {
      console.log("⚠️ Reconnect error:", err);
    });

    newSocket.on("reconnect_failed", () => {
      console.log("🚫 Reconnect failed");
      setStatus("disconnected");
    });

    newSocket.on(TrackingEvents.TRACKER_REGISTERED, addOrUpdateTracker);
    newSocket.on(TrackingEvents.TRACKER_UPDATED, addOrUpdateTracker);
    newSocket.on(TrackingEvents.TRACKER_STOPPED, addOrUpdateTracker);
    newSocket.on(TrackingEvents.TRACKER_REMOVED, removeTracker);

    newSocket.on("exception", handleException);
    newSocket.on("error", handleError);

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (trackerData) {
      setTrackers(trackerData);
    }
  }, [trackerData]);

  return (
    <TrackerContext.Provider
      value={{
        socket,
        trackers,
        status,
        selectedTracker,
        setSelectedTracker,
        subscribeTrackers,
        unsubscribeTrackers,
      }}
      {...props}
    />
  );
};

export const useTrackerData = (): TrackerContextValue =>
  useContext(TrackerContext);
