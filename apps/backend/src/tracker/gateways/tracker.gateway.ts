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

    const tracker = this.trackerService.findTrackerBySocketClient(client.id);
    if (tracker) {
      this.trackerService.stopTracker(tracker.id);
      this.server
        .to(trackingRooms.SUBSCRIBED)
        .emit(TrackingEvents.TRACKER_STOPPED, tracker);
    }
  }

  @SubscribeMessage(TrackingEvents.TRACKER_SUBSCRIBE)
  async handleSubscribe(@ConnectedSocket() client: Socket) {
    await client.join(trackingRooms.SUBSCRIBED);

    return { status: 'success', message: 'Subscribed to tracking room' };
  }

  @SubscribeMessage(TrackingEvents.TRACKER_UNSUBSCRIBE)
  async handleUnsubscribe(@ConnectedSocket() client: Socket) {
    await client.leave(trackingRooms.SUBSCRIBED);

    return { status: 'success', message: 'Unsubscribed from tracking room' };
  }

  @SubscribeMessage(TrackingEvents.TRACKER_REGISTER)
  @UsePipes(new SocketZodValidationPipe(registerTrackerSchema))
  handleTrackerRegister(
    @MessageBody() data: RegisterTrackerDto,
    @ConnectedSocket() client: Socket,
  ) {
    const tracker = this.trackerService.addTracker({
      name: `${client.data?.user?.name || 'Unknown Tracker'}`,
      socketClientId: client.id,
      coordinate: {
        lat: data.lat,
        lng: data.lng,
      },
    });

    this.server
      .to(trackingRooms.SUBSCRIBED)
      .emit(TrackingEvents.TRACKER_REGISTERED, tracker);
  }

  @SubscribeMessage(TrackingEvents.TRACKER_UPDATE)
  @UsePipes(new SocketZodValidationPipe(updateLocationSchema))
  handleLocationUpdate(
    @MessageBody()
    data: UpdateLocationDto,
    @ConnectedSocket() client: Socket,
  ) {
    let tracker = this.trackerService.findTrackerBySocketClient(client.id);

    if (!tracker) {
      throw new TrackerNotFoundException();
    }

    tracker = this.trackerService.updateLocation(tracker.id, {
      lat: data.lat,
      lng: data.lng,
    });

    this.server
      .to(trackingRooms.SUBSCRIBED)
      .emit(TrackingEvents.TRACKER_UPDATED, tracker);
  }

  @SubscribeMessage(TrackingEvents.TRACKER_STOP)
  handleLocationStop(@ConnectedSocket() client: Socket) {
    const tracker = this.trackerService.findTrackerBySocketClient(client.id);
    if (!tracker) {
      throw new TrackerNotFoundException();
    }

    this.trackerService.stopTracker(tracker.id);
    this.server
      .to(trackingRooms.SUBSCRIBED)
      .emit(TrackingEvents.TRACKER_STOPPED, tracker);
  }

  @SubscribeMessage(TrackingEvents.TRACKER_REMOVE)
  handleTrackerRemove(@ConnectedSocket() client: Socket) {
    const tracker = this.trackerService.findTrackerBySocketClient(client.id);

    if (!tracker) {
      throw new TrackerNotFoundException();
    }

    this.trackerService.removeTracker(tracker.id);
    this.server
      .to(trackingRooms.SUBSCRIBED)
      .emit(TrackingEvents.TRACKER_REMOVED, tracker);
  }
}
