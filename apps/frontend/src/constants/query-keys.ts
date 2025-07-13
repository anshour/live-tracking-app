export const queryKeys = {
  trackers: ["trackers"],
  myTrackers: ["trackers", "me"],
  trackerHistoriesAll: ["tracker-histories"],
  trackerHistories: (id: number) => ["tracker-histories", id],
  simulationStatus: ["simulation-status"],
  profile: ["profile"],
};
