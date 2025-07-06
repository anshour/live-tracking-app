import React from "react";
import { useTrackerData } from "~/context";
import { TrackerDetailSection } from "./tracker-detail-section";
import TrackerListSection from "./tracker-list-section";
import { Card } from "../ui";

export const TrackerDataCard = () => {
  const { selectedTracker } = useTrackerData();

  return (
    <Card className="absolute top-22 left-2 z-10 w-full max-w-100">
      {!!selectedTracker && <TrackerDetailSection />}
      {!selectedTracker && <TrackerListSection />}
    </Card>
  );
};
