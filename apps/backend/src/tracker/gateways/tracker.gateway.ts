import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrackerService } from '../services/tracker.service';
import { Logger, UseGuards, UsePipes } from '@nestjs/common';
import { TrackingEvents } from '@livetracking/shared';
import { trackingRooms } from '../constants/tracking-rooms';
import { SocketZodValidationPipe } from 'src/common/pipes/socket-zod-validation.pipe';
import {
  RegisterTrackerDto,
  registerTrackerSchema,
} from '../dto/register-tracker.dto';
import {
  UpdateLocationDto,
  updateLocationSchema,
} from '../dto/update-location.dto';
import {
  SubscribeByAccessCodeDto,
  subscribeByAccessCodeSchema,
} from '../dto/subscribe-by-access-code.dto';
import { TrackerNotFoundException } from '../exceptions/tracker-not-found.exception';
import { AuthSocketGuard } from 'src/auth/guards/auth-socket.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/socket',
})
@UseGuards(AuthSocketGuard)
export class TrackerGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('TrackerGateway');

  constructor(private readonly trackerService: TrackerService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(TrackingEvents.TRACKER_REGISTER)
  @UsePipes(new SocketZodValidationPipe(registerTrackerSchema))
  async handleTrackerRegister(
    @MessageBody() data: RegisterTrackerDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = Number(client.data.user!.id);
    const tracker = await this.trackerService.addTracker(userId, {
      name: client.data.user!.name || 'Unknown Tracker',
      socketClientId: client.id,
      lastLat: data.lat,
      lastLng: data.lng,
      lastLocationName: 'Unknown Location', // TODO: Resolve location name
      userId: userId,
    });

    this.server
      .to(trackingRooms.getRoomByAccessCode(tracker.accessCode))
      .emit(TrackingEvents.TRACKER_REGISTERED, tracker);
  }

  @SubscribeMessage(TrackingEvents.TRACKER_UPDATE)
  @UsePipes(new SocketZodValidationPipe(updateLocationSchema))
  async handleLocationUpdate(
    @MessageBody()
    data: UpdateLocationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = Number(client.data.user!.id);
    let tracker = await this.trackerService.findTrackerByUserId(userId);

    if (!tracker) {
      throw new TrackerNotFoundException();
    }

    tracker = await this.trackerService.updateLocation(tracker.id, {
      lat: data.lat,
      lng: data.lng,
    });

    this.server
      .to(trackingRooms.getRoomByAccessCode(tracker.accessCode))
      .emit(TrackingEvents.TRACKER_UPDATED, tracker);
  }

  @SubscribeMessage(TrackingEvents.TRACKER_STOP)
  async handleLocationStop(@ConnectedSocket() client: Socket) {
    const userId = Number(client.data.user!.id);
    const tracker = await this.trackerService.findTrackerByUserId(userId);

    if (!tracker) {
      throw new TrackerNotFoundException();
    }

    await this.trackerService.stopTracker(tracker.id);

    this.server
      .to(trackingRooms.getRoomByAccessCode(tracker.accessCode))
      .emit(TrackingEvents.TRACKER_STOPPED, tracker);
  }

  @SubscribeMessage(TrackingEvents.TRACKER_REMOVE)
  async handleTrackerRemove(@ConnectedSocket() client: Socket) {
    const userId = Number(client.data.user!.id);
    const tracker = await this.trackerService.findTrackerByUserId(userId);

    if (!tracker) {
      throw new TrackerNotFoundException();
    }

    await this.trackerService.removeTracker(tracker.id);

    this.server
      .to(trackingRooms.getRoomByAccessCode(tracker.accessCode))
      .emit(TrackingEvents.TRACKER_REMOVED, tracker);
  }

  @SubscribeMessage(TrackingEvents.TRACKER_SUBSCRIBE_BY_ACCESS_CODE)
  @UsePipes(new SocketZodValidationPipe(subscribeByAccessCodeSchema))
  async handleSubscribeByAccessCode(
    @MessageBody() data: SubscribeByAccessCodeDto,
    @ConnectedSocket() client: Socket,
  ) {
    const tracker = await this.trackerService.findTrackerByAccessCode(
      data.accessCode,
    );

    if (!tracker) {
      return {
        status: 'failed',
      };
    }

    const trackerRoom = trackingRooms.getRoomByAccessCode(tracker.accessCode);
    await client.join(trackerRoom);

    return {
      status: 'success',
    };
  }

  @SubscribeMessage(TrackingEvents.TRACKER_UNSUBSCRIBE_BY_ACCESS_CODE)
  @UsePipes(new SocketZodValidationPipe(subscribeByAccessCodeSchema))
  async handleUnsubscribeByAccessCode(
    @MessageBody() data: SubscribeByAccessCodeDto,
    @ConnectedSocket() client: Socket,
  ) {
    const tracker = await this.trackerService.findTrackerByAccessCode(
      data.accessCode,
    );

    if (!tracker) {
      throw new TrackerNotFoundException();
    }

    const trackerRoom = trackingRooms.getRoomByAccessCode(tracker.accessCode);
    await client.leave(trackerRoom);

    return {
      status: 'success',
      message: `Unsubscribed from tracker: ${tracker.name}`,
    };
  }
}
