import React from "react";
import { Button, Card, StatusIndicator } from "../ui";

interface Props {
  isTracking: boolean;
  coordinate: { lat: number; lng: number } | null;
  startTracking: () => void;
  stopTracking: () => void;
}

const TrackerControlCard = ({
  isTracking,
  coordinate,
  startTracking,
  stopTracking,
}: Props) => {
  return (
    <div className="absolute inset-x-0 flex justify-center bottom-10 z-10">
      <div className="w-90">
        <Card className="p-4">
          <div className="flex items-start gap-2 justify-center py-3">
            <div className="pt-1.5">
              <StatusIndicator
                status={isTracking ? "connected" : "disconnected"}
              />
            </div>
            <div>
              <p className="font-semibold">
                {isTracking ? "Tracking Started" : "Tracking Stopped"}
              </p>
              <p>
                Location:{" "}
                {coordinate ? (
                  <span>
                    {coordinate.lat.toFixed(7)}, {coordinate.lng.toFixed(7)}
                  </span>
                ) : (
                  "Unknown location"
                )}
              </p>
            </div>
          </div>
          <div className="text-center">
            <Button
              className="mt-2"
              onClick={isTracking ? stopTracking : startTracking}
            >
              {isTracking ? "Stop Tracking" : "Start Tracking"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TrackerControlCard;
