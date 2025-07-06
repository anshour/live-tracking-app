import { WsException } from '@nestjs/websockets';

export class SocketUnauthorizedException extends WsException {
  constructor(message = 'Unauthorized') {
    super({
      status: 'error',
      code: 'UNAUTHORIZED',
      message,
    });
  }
}
