import { WsException } from '@nestjs/websockets';

export class TrackerNotFoundException extends WsException {
  constructor(message = 'Tracker not found') {
    super({
      status: 'error',
      code: 'TRACKER_NOT_FOUND',
      message,
    });
  }
}
