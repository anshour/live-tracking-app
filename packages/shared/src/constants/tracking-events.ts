export const TrackingEvents = {
  TRACKER_SUBSCRIBE: "tracker:subscribe",
  TRACKER_SUBSCRIBE_BY_ACCESS_CODE: "tracker:subscribe:access_code",
  TRACKER_UNSUBSCRIBE: "tracker:unsubscribe",
  TRACKER_UNSUBSCRIBE_BY_ACCESS_CODE: "tracker:unsubscribe:access_code",

  TRACKER_REGISTER: "tracker:register",
  TRACKER_REGISTERED: "tracker:registered",
  TRACKER_UPDATE: "tracker:update",
  TRACKER_UPDATED: "tracker:updated",
  TRACKER_STOP: "tracker:stop",
  TRACKER_STOPPED: "tracker:stopped",
  TRACKER_REMOVE: "tracker:remove",
  TRACKER_REMOVED: "tracker:removed",
} as const;
