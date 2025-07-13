import { TrackerSimulationService } from '../services/tracker-simulation.service';
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('api/trackers/simulation')
@UseGuards(AuthGuard)
export class TrackerSimulationController {
  constructor(private readonly simulationService: TrackerSimulationService) {}
  @Post('start')
  async simulateTracker(): Promise<Record<string, string>> {
    await this.simulationService.startSimulation();

    return {
      message: 'Tracker simulation started',
    };
  }

  @Post('stop')
  async stopSimulation(): Promise<Record<string, string>> {
    await this.simulationService.stopSimulation();

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
