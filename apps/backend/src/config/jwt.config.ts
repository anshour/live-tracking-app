import { registerAs } from '@nestjs/config';

const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'defaultSecret',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
}));

//TODO: ADD CONFIG VALIDATION

export default jwtConfig;
