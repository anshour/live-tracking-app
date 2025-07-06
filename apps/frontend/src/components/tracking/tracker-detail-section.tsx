import React from "react";
import { IconButton, StatusIndicator } from "../ui";
import { timeAgo } from "~/utils";
import { X } from "lucide-react";
import { useFetchTrackerHistory } from "~/hooks";
import dayjs from "dayjs";
import { useTrackerData } from "~/context";

export const TrackerDetailSection = () => {
  const { selectedTracker, setSelectedTracker } = useTrackerData();
  const { histories } = useFetchTrackerHistory(selectedTracker?.id || "");

  return (
    <div className="max-h-96 overflow-auto border border-gray-200 p-2 rounded-md">
      <div className="flex justify-between ">
        <div className="flex items-start gap-2 mt-2">
          <div className="pt-1">
            <StatusIndicator
              status={selectedTracker?.isOnline ? "connected" : "disconnected"}
            />
          </div>
          <div>
            <p className="text-sm font-semibold">
              <span>{selectedTracker?.name}</span>
            </p>
            <p className="text-sm text-gray-500">
              Coordinate:{" "}
              {selectedTracker?.coordinate !== null ? (
                <span>
                  {selectedTracker?.coordinate.lat.toFixed(7)},{" "}
                  {selectedTracker?.coordinate.lng.toFixed(7)}
                </span>
              ) : (
                "Unknown location"
              )}
            </p>
            <p className="text-sm text-gray-500">
              Last Seen: {timeAgo(selectedTracker?.lastSeen || "")}{" "}
            </p>
          </div>
        </div>
        <div>
          <IconButton
            icon={X}
            aria-label="Close"
            variant="ghost"
            onClick={() => setSelectedTracker(null)}
          />
        </div>
      </div>
      <div className="border-b-2 border-gray-200 mt-2"></div>

      <table className="w-full mt-3">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wide py-2 px-1">
              Timestamp
            </th>
            <th className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wide py-2 px-1">
              Latitude
            </th>
            <th className="text-left text-xs font-semibold text-gray-700 uppercase tracking-wide py-2 px-1">
              Longitude
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {histories.map((history) => (
            <tr key={history.id} className="hover:bg-gray-50">
              <td className="text-sm text-gray-900 py-2 px-1 font-mono">
                {dayjs(history.timestamp).format("YYYY-MM-DD HH:mm:ss")}
              </td>
              <td className="text-sm text-gray-900 py-2 px-1 font-mono">
                {history.coordinate.lat.toFixed(7)}
              </td>
              <td className="text-sm text-gray-900 py-2 px-1 font-mono">
                {history.coordinate.lng.toFixed(7)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
