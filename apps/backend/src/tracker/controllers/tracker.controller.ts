import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { TrackerService } from '../services/tracker.service';
import { Tracker, TrackerHistory } from '@livetracking/shared';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('api/trackers')
@UseGuards(AuthGuard)
export class TrackerController {
  constructor(private readonly trackerService: TrackerService) {}

  @Get()
  async getAllTrackers(): Promise<Tracker[]> {
    // TODO: ONLY SHOW TRACKERS THAT THE USER IS SUBSCRIBED TO
    return this.trackerService.getAllTrackers();
  }

  @Get('/me')
  async getMyTracker(@Request() req): Promise<Tracker | null> {
    const userId = req.user.id as number;
    return this.trackerService.findTrackerByUserId(userId);
  }

  @Get(':id/histories')
  async getTrackerHistory(@Param('id') id: string): Promise<TrackerHistory[]> {
    // TODO: CAN ONLY SHOW TRACKERS THAT THE USER IS SUBSCRIBED TO
    return this.trackerService.getTrackerHistory(parseInt(id, 10));
  }
}
