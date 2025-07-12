import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TrackerModule } from './tracker/modules/tracker.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(databaseConfig.asProvider()),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, appConfig, jwtConfig],
    }),
    TrackerModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
