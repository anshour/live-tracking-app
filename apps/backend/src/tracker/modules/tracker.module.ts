import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { TrackerController } from '../controllers/tracker.controller';
import { TrackerService } from '../services/tracker.service';
import { TrackerGateway } from '../gateways/tracker.gateway';
import { TrackerSimulationService } from '../services/tracker-simulation.service';
import { TrackerSimulationController } from '../controllers/tracker-simulation.controller';
import { AuthSocketGuard } from 'src/auth/guards/auth-socket.guard';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  controllers: [TrackerController, TrackerSimulationController],
  providers: [
    TrackerService,
    TrackerGateway,
    TrackerSimulationService,
    AuthSocketGuard,
  ],
})
export class TrackerModule {}
