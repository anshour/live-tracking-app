export interface Tracker {
  id: string;
  name: string;
  lastSeen: Date;
  latitude: number;
  longitude: number;
  isOnline: boolean;
}
