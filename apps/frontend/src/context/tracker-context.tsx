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
import { useNavigatorOnline } from "~/hooks";
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
  setSelectedTracker: () => {},
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
  const isNavigatorOnline = useNavigatorOnline();
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
    setTrackers((prev) => prev.filter((t) => t.id !== tracker.id));
  }, []);

  const handleError = (error: any) => {
    console.error("WebSocket error:", error);
    toast.error("An error occurred while connecting to the WebSocket server.");
  };

  const handleException = (exception: any) => {
    if (exception?.status === 401) {
      toast.error("You are not authorized to access this resource.");
    } else {
      console.error("WebSocket exception:", exception);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    if (!token) return;

    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/socket`, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
    });

    // Register event listeners
    newSocket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
      setStatus("connected");
      refetch();
    });

    newSocket.on("disconnect", (reason) => {
      console.log(`🚫 Disconnected: ${reason}`);
      setStatus("disconnected");
      refetch();
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

    newSocket.on("connect_error", (err) => {
      console.log("❌ Connect error:", err.message);
    });

    newSocket.on("exception", handleException);
    newSocket.on("error", handleError);

    newSocket.on(TrackingEvents.TRACKER_REGISTERED, addOrUpdateTracker);
    newSocket.on(TrackingEvents.TRACKER_UPDATED, addOrUpdateTracker);
    newSocket.on(TrackingEvents.TRACKER_STOPPED, addOrUpdateTracker);
    newSocket.on(TrackingEvents.TRACKER_REMOVED, removeTracker);

    // Set socket after all listeners are ready
    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
      newSocket.close();
    };
  }, []);

  // Connect/disconnect socket based on online status
  useEffect(() => {
    if (!socket) return;

    if (isNavigatorOnline) {
      console.log("🌐 Online - connecting socket...");
      socket.connect();
    } else {
      console.log("📴 Offline - disconnecting socket...");
      socket.disconnect();
    }
  }, [isNavigatorOnline, socket]);

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
        selectedTracker,
        setSelectedTracker,
        subscribeTrackers,
        unsubscribeTrackers,
        status,
      }}
      {...props}
    />
  );
};

export const useTrackerData = (): TrackerContextValue =>
  useContext(TrackerContext);
