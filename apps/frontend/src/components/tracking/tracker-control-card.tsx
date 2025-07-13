import React from "react";
import { Button, Card, IconButton, StatusIndicator } from "../ui";
import { useFetchMyTrackerData } from "~/hooks";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";
import { Tracker } from "@livetracking/shared";

interface Props {
  isTracking: boolean;
  coordinate: { lat: number; lng: number } | null;
  startTracking: () => void;
  stopTracking: () => void;
  tracker: Tracker | null;
}

const TrackerControlCard = ({
  isTracking,
  coordinate,
  startTracking,
  stopTracking,
  tracker,
}: Props) => {
  const handleClickCopy = () => {
    if (tracker?.accessCode) {
      navigator.clipboard.writeText(tracker.accessCode);
      toast.success("Access code copied to clipboard");
    }
  };

  return (
    <div className="absolute inset-x-0 flex justify-center bottom-10 z-10">
      <div className="w-100">
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
                  <span className="text-gray-500">Unknown Location</span>
                )}
              </p>
              {!tracker ? (
                <p>
                  Access Code:{" "}
                  <span className="text-gray-500">Not available</span>
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <p>Access Code: {tracker?.accessCode} </p>
                  <IconButton
                    icon={Copy}
                    aria-label="Copy access code"
                    size="small"
                    onClick={handleClickCopy}
                    variant="ghost"
                  />
                </div>
              )}
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
