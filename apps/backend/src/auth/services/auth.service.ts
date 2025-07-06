import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { User } from '@livetracking/shared';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  validateCredentials(email: string, password: string): User | null {
    const user = this.userService.findByEmail(email);
    if (user && user.password === password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return null;
  }

  async login(email: string, password: string) {
    const user = this.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, name: user.name };

    // For simplicity, we use a static expiration time of 2 hours.
    // In a real application, we might want to use a refresh token strategy
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '2h',
    });

    return {
      success: true,
      message: 'Login successful',
      user,
      token,
    };
  }
}
