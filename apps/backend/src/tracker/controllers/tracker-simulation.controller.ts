import { Controller, Get, Post } from '@nestjs/common';
import { TrackerSimulationService } from '../services/tracker-simulation.service';

@Controller('api/trackers/simulation')
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
