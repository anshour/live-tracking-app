import { Tracker, Coordinate, calculateDistance } from '@livetracking/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrackerEntity } from '../entity/tracker.entity';
import { LessThan, Repository } from 'typeorm';
import { TrackerHistoryEntity } from '../entity/tracker-history';

@Injectable()
export class TrackerService {
  private readonly DISTANCE_THRESHOLD = 2000; // 2 km in meters
  private readonly MAX_HISTORY_ENTRIES = 20;

  constructor(
    @InjectRepository(TrackerEntity)
    private readonly trackerRepository: Repository<TrackerEntity>,
    @InjectRepository(TrackerHistoryEntity)
    private readonly trackerHistoryRepository: Repository<TrackerHistoryEntity>,
  ) {}

  private async addHistory(
    trackerId: number,
    coordinate: Coordinate,
  ): Promise<void> {
    const currentHistory = await this.trackerHistoryRepository.find({
      where: { trackerId: trackerId },
      order: { timestamp: 'DESC' },
    });

    if (currentHistory.length >= this.MAX_HISTORY_ENTRIES) {
      await this.trackerHistoryRepository.delete({
        timestamp: LessThan(currentHistory[0].timestamp),
      });
    }

    const historyEntry = new TrackerHistoryEntity();
    historyEntry.trackerId = trackerId;
    historyEntry.lat = coordinate.lat;
    historyEntry.lng = coordinate.lng;
    historyEntry.timestamp = new Date();

    await this.trackerHistoryRepository.save(historyEntry);
  }

  async findTrackerByUserId(userId: number): Promise<TrackerEntity | null> {
    const tracker = await this.trackerRepository.findOne({
      where: { userId: userId },
    });

    return tracker;
  }

  async addTracker(
    userId: number,
    tracker: Omit<Tracker, 'id' | 'isOnline' | 'lastSeen' | 'accessCode'>,
  ): Promise<TrackerEntity> {
    const existingTracker = await this.findTrackerByUserId(userId);

    if (existingTracker) {
      return existingTracker;
    }

    const newTracker = new TrackerEntity();
    newTracker.name = tracker.name;
    newTracker.socketClientId = tracker.socketClientId;
    newTracker.isOnline = true;
    newTracker.lastSeen = new Date().toISOString();
    newTracker.lastLocationName = '';
    newTracker.lastLat = tracker.lastLat;
    newTracker.lastLng = tracker.lastLng;
    newTracker.userId = userId;
    newTracker.accessCode = await this.generateUniqueAccessCode();

    await this.trackerRepository.save(newTracker);

    return newTracker;
  }

  async removeTracker(id: number): Promise<void> {
    await this.trackerRepository.delete({ id });
  }

  async updateLocation(
    trackerId: number,
    coordinate: Coordinate,
  ): Promise<TrackerEntity> {
    const tracker = await this.trackerRepository.findOne({
      where: { id: trackerId },
    });
    if (!tracker) {
      throw new Error(`Tracker with id ${trackerId} not found`);
    }

    const distance = calculateDistance(
      { lat: tracker.lastLat, lng: tracker.lastLng },
      coordinate,
    );
    if (distance > this.DISTANCE_THRESHOLD) {
      await this.addHistory(trackerId, coordinate);
    }

    tracker.isOnline = true;
    tracker.lastLat = coordinate.lat;
    tracker.lastLng = coordinate.lng;
    tracker.lastSeen = new Date().toISOString();

    await this.trackerRepository.save(tracker);

    return tracker;
  }

  async stopTracker(trackerId: number): Promise<TrackerEntity | null> {
    const tracker = await this.trackerRepository.findOne({
      where: { id: trackerId },
    });
    if (!tracker) {
      throw new Error(`Tracker with id ${trackerId} not found`);
    }

    tracker.isOnline = false;
    tracker.lastSeen = new Date().toISOString();

    await this.trackerRepository.save(tracker);

    return tracker;
  }

  async getAllTrackers(): Promise<TrackerEntity[]> {
    return this.trackerRepository.find();
  }

  async getTrackerHistory(id: number): Promise<TrackerHistoryEntity[]> {
    return this.trackerHistoryRepository.find({
      where: { trackerId: id },
      order: { timestamp: 'DESC' },
    });
  }

  async findTrackerByAccessCode(
    accessCode: string,
  ): Promise<TrackerEntity | null> {
    const tracker = await this.trackerRepository.findOne({
      where: { accessCode: accessCode.toUpperCase().replace(/\s/g, '') },
    });
    return tracker;
  }

  /**
   * Generate unique access code (check database untuk memastikan tidak duplikat)
   */
  private async generateUniqueAccessCode(): Promise<string> {
    let code: string;
    let isUnique = false;

    do {
      code = this.generateAccessCode();
      const existingTracker = await this.trackerRepository.findOne({
        where: { accessCode: code },
      });
      isUnique = !existingTracker;
    } while (!isUnique);

    return code;
  }

  private generateAccessCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Tanpa 0, O, I, 1
    let code = '';

    // Generate 16 karakter
    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];

      if ((i + 1) % 4 === 0 && i < 15) {
        code += '-';
      }
    }

    return code;
  }
}
