import { registerAs } from '@nestjs/config';

const appConfig = registerAs('app', () => ({
  host: process.env.APP_HOST || 'localhost',
  port: parseInt(process.env.APP_PORT || '3001', 10),
  environment: process.env.APP_ENV || 'development',
}));

//TODO: ADD CONFIG VALIDATION

export default appConfig;
