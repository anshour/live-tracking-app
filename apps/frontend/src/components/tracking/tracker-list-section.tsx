import React from "react";
import { useTrackerData } from "~/context";
import {
  useFetchSimulationStatus,
  useStartSimulation,
  useStopSimulation,
} from "~/hooks";
import { Button, IconButton, Input, StatusIndicator } from "../ui";
import { MapPinPlus, Search } from "lucide-react";
import { timeAgo } from "~/utils";
import { ConnectTrackerModal } from "./connect-tracker-modal";

const TrackerListSection = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isConnectModalOpen, setIsConnectModalOpen] = React.useState(false);
  const { trackers, selectedTracker, setSelectedTracker } = useTrackerData();

  const filteredTrackers = React.useMemo(
    () =>
      trackers.filter((tracker) =>
        tracker.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [trackers, searchQuery]
  );

  const { simulationStatus } = useFetchSimulationStatus();
  const { mutate: startSimulation, isPending: isStarting } =
    useStartSimulation();
  const { mutate: stopSimulation, isPending: isStopping } = useStopSimulation();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get("search") as string;

    setSearchQuery(searchQuery);
  };

  return (
    <>
      <form onSubmit={handleSearch} className="flex gap-2 items-center mb-2">
        <Input placeholder="Search..." size="small" name="search" />
        <IconButton icon={Search} aria-label="Search" />
      </form>
      <div className="grid grid-cols-1 gap-1 max-h-96 overflow-auto">
        {filteredTrackers.map((tracker) => (
          <div
            key={tracker.id}
            className="border border-gray-200 p-2 rounded-md cursor-pointer"
            onClick={() => setSelectedTracker(tracker)}
          >
            <div>
              <div className="flex items-start gap-2">
                <div className="pt-1">
                  <StatusIndicator
                    status={tracker.isOnline ? "connected" : "disconnected"}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">{tracker.name}</p>
                  <p className="text-sm text-gray-500">
                    Coordinate:{" "}
                    {tracker.lastLat !== null ? (
                      <span>
                        {tracker.lastLat.toFixed(7)},{" "}
                        {tracker.lastLng.toFixed(7)}
                      </span>
                    ) : (
                      "Unknown location"
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Last Seen: {timeAgo(tracker.lastSeen)}{" "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {trackers.length < 1 && (
        <div className="py-8">
          <p className="text-gray-600 text-center">
            There are no active trackers, click simulate to add some.
          </p>
        </div>
      )}
      <br />
      <div className="border-b border-gray-200 mb-2"></div>
      <div className="flex gap-2 items-center">
        <Button
          size="small"
          onClick={() => setIsConnectModalOpen(true)}
          className="whitespace-nowrap"
          leftIcon={MapPinPlus}
        >
          Connect Tracker
        </Button>

        {/* TODO : Add start and stop simulation button */}
        {/* <Button
          size="small"
          isLoading={isStopping}
          onClick={() => stopSimulation()}
        >
          Stop Simulation
        </Button> */}
        {/* 
        <Button
            size="small"
            isLoading={isStarting}
            onClick={() => startSimulation()}
          >
            Start Simulation
          </Button>
           */}
      </div>
      <ConnectTrackerModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </>
  );
};

export default TrackerListSection;
