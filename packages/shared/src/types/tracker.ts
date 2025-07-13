export interface Tracker {
  id: number;
  name: string;
  userId: number;
  socketClientId: string;
  isOnline: boolean;
  lastSeen: string;
  lastLocationName: string;
  lastLat: number;
  lastLng: number;
  accessCode: string;
}

export interface TrackerHistory {
  id: number;
  lat: number;
  lng: number;
  trackerId: number;
  timestamp: Date;
}

export interface Coordinate {
  lat: number;
  lng: number;
}
