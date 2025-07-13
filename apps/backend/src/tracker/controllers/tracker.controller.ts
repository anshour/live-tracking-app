import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TrackerService } from '../services/tracker.service';
import { Tracker, TrackerHistory } from '@livetracking/shared';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('api/trackers')
@UseGuards(AuthGuard)
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @Get()
  async getAllTrackers(): Promise<Tracker[]> {
    return this.trackerService.getAllTrackers();
  }

  @Get(':id/histories')
  async getTrackerHistory(@Param('id') id: string): Promise<TrackerHistory[]> {
    return this.trackerService.getTrackerHistory(parseInt(id, 10));
  }
}
