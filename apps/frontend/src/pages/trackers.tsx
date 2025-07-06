import { StatusInfoCard } from "~/components/tracking/status-info-card";
import {
  AuthenticatedLayout,
  LiveTrackingMap,
  TrackerDataCard,
} from "../components";
import { useTrackerData } from "~/context";
import { useEffect } from "react";

export default function Page() {
  const { status, subscribeTrackers, unsubscribeTrackers } = useTrackerData();

  useEffect(() => {
    if (status === "connected") {
      subscribeTrackers();
    }

    return () => {
      unsubscribeTrackers();
    };
  }, [status]);

  return (
    <div className="min-h-screen bg-gray-100 relative">
      <StatusInfoCard />
      <TrackerDataCard />
      <LiveTrackingMap />
    </div>
  );
}

Page.layout = function (page: any) {
  return <AuthenticatedLayout>{page}</AuthenticatedLayout>;
};
