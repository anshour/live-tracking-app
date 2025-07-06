import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TrackerModule } from './tracker/modules/tracker.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TrackerModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
