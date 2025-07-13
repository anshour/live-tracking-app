import { TrackerSimulationController } from '../controllers/tracker-simulation.controller';
import { TrackerSimulationService } from '../services/tracker-simulation.service';
import { TrackerController } from '../controllers/tracker.controller';
import { AuthSocketGuard } from 'src/auth/guards/auth-socket.guard';
import { TrackerHistoryEntity } from '../entity/tracker-history';
import { TrackerService } from '../services/tracker.service';
import { TrackerGateway } from '../gateways/tracker.gateway';
import { TrackerEntity } from '../entity/tracker.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([TrackerEntity, TrackerHistoryEntity]),
  ],
  controllers: [TrackerController, TrackerSimulationController],
  providers: [
    TrackerService,
    TrackerGateway,
    TrackerSimulationService,
    AuthSocketGuard,
  ],
})
export class TrackerModule {}
