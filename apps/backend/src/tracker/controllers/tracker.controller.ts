import { Controller, Get, Param } from '@nestjs/common';
import { TrackerService } from '../services/tracker.service';
import { Tracker, TrackerHistory } from '@livetracking/shared';

@Controller('api/trackers')
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @Get()
  getAllTrackers(): Tracker[] {
    return this.trackerService.getAllTrackers();
  }

  @Get(':id/histories')
  getTrackerHistory(@Param('id') id: string): TrackerHistory[] {
    return this.trackerService.getTrackerHistory(id);
  }
}
