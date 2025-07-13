import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { MAP_CONTAINER_STYLE, MAP_DEFAULT_CENTER } from "~/constants";
import { Coordinate, TrackingEvents } from "@livetracking/shared";
import { TrackerMarkerIcon } from "./tracker-marker-icon";
import TrackerControlCard from "./tracker-control-card";
import { useTrackerData } from "~/context";
import { useFetchMyTrackerData, useOutsideClick } from "~/hooks";
import toast from "react-hot-toast";

const TRACKING_INTERVAL = 1000;

export const SharingLocationMap = () => {
  // State
  const [isTracking, setIsTracking] = useState(false);
  const [coordinate, setCoordinate] = useState<Coordinate | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { tracker, refetch } = useFetchMyTrackerData();

  // Refs
  const ref = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const { socket } = useTrackerData();
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  useOutsideClick({
    ref,
    handler: () => setHasInteracted(false),
  });

  // Helper functions
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  const updateLocation = async () => {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const newCoordinate = { lat: latitude, lng: longitude };

      setCoordinate(() => {
        socket?.emit(TrackingEvents.TRACKER_UPDATE, newCoordinate);
        return newCoordinate;
      });
    } catch (error) {
      console.error("Error getting location:", error);
      toast.error("Failed to update location");
    }
  };

  const registerTracker = async () => {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const newCoordinate = { lat: latitude, lng: longitude };

      setCoordinate(newCoordinate);
      socket?.emit(TrackingEvents.TRACKER_REGISTER, newCoordinate, () => {
        refetch();
      });

      return true;
    } catch (error) {
      toast.error(
        "Unable to retrieve your location. Please enable location services."
      );
      return false;
    }
  };

  const startTracking = async () => {
    const registered = await registerTracker();
    if (!registered) return;

    setIsTracking(true);

    // Start interval to update location every second
    intervalRef.current = setInterval(updateLocation, TRACKING_INTERVAL);
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      socket?.emit(TrackingEvents.TRACKER_STOP);
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsTracking(false);
  };

  // Map callbacks
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapInteraction = () => setHasInteracted(true);

  useEffect(() => {
    // Center map on user location if not interacted
    if (map && coordinate && !hasInteracted) {
      map.panTo(coordinate);
      map.setZoom(13);
    }
  }, [map, coordinate, hasInteracted]);

  useEffect(() => {
    // Handle socket errors
    if (socket) {
      socket.on("exception", () => {
        toast.error("An error occurred with the tracking service.");
        stopTracking();
      });
    }

    return () => {
      if (socket) {
        socket.off("exception");
      }
    };
  }, [socket]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div>
      <div onWheel={handleMapInteraction} ref={ref}>
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={MAP_DEFAULT_CENTER}
          onUnmount={onUnmount}
          onClick={handleMapInteraction}
          onDragStart={handleMapInteraction}
          onLoad={onLoad}
          zoom={11}
        >
          {coordinate && (
            <Marker
              position={coordinate}
              draggable={false}
              icon={TrackerMarkerIcon({ name: "You" })}
            />
          )}
        </GoogleMap>
      </div>

      <TrackerControlCard
        isTracking={isTracking}
        coordinate={coordinate}
        startTracking={startTracking}
        stopTracking={stopTracking}
        tracker={tracker}
      />
    </div>
  );
};
