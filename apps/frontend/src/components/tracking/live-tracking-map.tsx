import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { TrackerMarkerIcon } from "./tracker-marker-icon";
import { useTrackerData } from "~/context";
import React, { useEffect, useRef } from "react";
import { useOutsideClick } from "~/hooks";
import { Button, Card } from "../ui";
import { LocateFixed } from "lucide-react";
import { MAP_CONTAINER_STYLE, MAP_DEFAULT_CENTER } from "~/constants";

const LiveTrackingMapContent = () => {
  const { trackers, selectedTracker, setSelectedTracker } = useTrackerData();
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const ref = useRef<HTMLDivElement | null>(null);

  useOutsideClick({
    ref,
    handler: () => setHasInteracted(false),
  });

  const handleClickCenter = () => {
    setHasInteracted(false);
    const validTrackers = trackers.filter(
      (tracker) => tracker.lastLat !== null
    );
    const bounds = new window.google.maps.LatLngBounds();
    validTrackers.forEach((tracker) => {
      bounds.extend({ lat: tracker.lastLat!, lng: tracker.lastLng! });
    });
    if (map) {
      map.panTo(MAP_DEFAULT_CENTER);
      map.setZoom(12);
    }
  };

  useEffect(() => {
    if (map) {
      const validTrackers = trackers.filter(
        (tracker) => tracker.lastLat !== null
      );

      if (selectedTracker && selectedTracker.lastLat !== null) {
        map.panTo({
          lat: selectedTracker.lastLat,
          lng: selectedTracker.lastLng,
        });
        map.setZoom(15);
        return;
      }

      if (hasInteracted) {
        return;
      }

      if (validTrackers.length === 1) {
        map.panTo({
          lat: validTrackers[0].lastLat!,
          lng: validTrackers[0].lastLng!,
        });
        map.setZoom(12);
        return;
      }

      if (validTrackers.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        validTrackers.forEach((tracker) => {
          bounds.extend({ lat: tracker.lastLat!, lng: tracker.lastLng! });
        });

        map.panToBounds(bounds, { top: 10, bottom: 10, left: 10, right: 10 });
        map.setZoom(12);
      }

      if (validTrackers.length === 0) {
        map.panTo(MAP_DEFAULT_CENTER);
        map.setZoom(12);
      }
    }
  }, [map, trackers, selectedTracker, hasInteracted]);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  return (
    <div>
      <div onWheel={() => setHasInteracted(true)} ref={ref}>
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={MAP_DEFAULT_CENTER}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={() => setHasInteracted(true)}
          onDragStart={() => setHasInteracted(true)}
        >
          {trackers
            .filter((tracker) => tracker.lastLat !== null)
            .map((tracker) => (
              <Marker
                key={tracker.id}
                position={{
                  lat: tracker.lastLat!,
                  lng: tracker.lastLng!,
                }}
                draggable={false}
                onClick={() => setSelectedTracker(tracker)}
                icon={TrackerMarkerIcon({ name: tracker.name })}
              />
            ))}
        </GoogleMap>
      </div>
      <Card className="absolute bottom-6 right-15 z-10 ">
        <Button rightIcon={LocateFixed} onClick={handleClickCenter}>
          Center Map
        </Button>
      </Card>
    </div>
  );
};

export const LiveTrackingMap = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return <LiveTrackingMapContent />;
};
