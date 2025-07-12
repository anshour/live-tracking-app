import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const databaseConfig = registerAs<TypeOrmModuleOptions>('database', () => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5423', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'defaultdb',
  schema: process.env.DATABASE_SCHEMA || 'public',
  synchronize: true,
  autoLoadEntities: true,
  logging: false,
}));

//TODO: ADD CONFIG VALIDATION

export default databaseConfig;
