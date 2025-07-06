export interface Tracker {
  id: string;
  name: string;
  socketClientId: string;
  lastSeen: string;
  isOnline: boolean;
  coordinate: Coordinate | null;
}

export interface TrackerHistory {
  id: string;
  trackerId: string;
  coordinate: Coordinate;
  timestamp: string;
}

export interface Coordinate {
  lat: number;
  lng: number;
}
