import { WsException } from '@nestjs/websockets';

export class SocketUnauthenticatedException extends WsException {
  constructor(message = 'Unauthenticated') {
    super({
      status: 'error',
      code: 'UNAUTHENTICATED',
      message,
    });
  }
}
