import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TrackerSimulationService } from '../services/tracker-simulation.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('api/trackers/simulation')
@UseGuards(AuthGuard)
export class TrackerSimulationController {
  constructor(private readonly simulationService: TrackerSimulationService) {}
  @Post('start')
  simulateTracker(): Record<string, string> {
    this.simulationService.startSimulation();

    return {
      message: 'Tracker simulation started',
    };
  }

  @Post('stop')
  stopSimulation(): Record<string, string> {
    this.simulationService.stopSimulation();

    return {
      message: 'Tracker simulation stopped',
    };
  }

  @Get('status')
  getSimulationStatus(): Record<string, boolean> {
    return {
      isActive: this.simulationService.isSimulationActive(),
    };
  }
}
