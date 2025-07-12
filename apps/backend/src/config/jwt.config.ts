import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

const jwtConfig = registerAs<JwtModuleOptions>('jwt', () => ({
  secret: process.env.JWT_SECRET || 'defaultSecret',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
}));

//TODO: ADD CONFIG VALIDATION

export default jwtConfig;
