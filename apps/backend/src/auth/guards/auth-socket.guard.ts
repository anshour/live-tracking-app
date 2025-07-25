import { SocketUnauthenticatedException } from 'src/common/exceptions/socket-unauthenticated.exception';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class AuthSocketGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      throw new SocketUnauthenticatedException(
        'Unauthenticated: No token provided',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      client.data.user = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
      };
    } catch {
      throw new SocketUnauthenticatedException(
        'Unauthenticated: Invalid or expired token',
      );
    }
    return true;
  }
}
