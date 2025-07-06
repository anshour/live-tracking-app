import { WsException } from '@nestjs/websockets';

export class SocketBadRequestException extends WsException {
  constructor(message = 'Bad Request') {
    super({
      status: 'error',
      code: 'BAD_REQUEST',
      message,
    });
  }
}
