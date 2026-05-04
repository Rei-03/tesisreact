import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NatsModule } from './nats/nats.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/entities/user.entity';
import { UserSeeder } from './auth/seeders/user.seeder';
import { env } from './config/env';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USERNAME,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      entities: [User],
      autoLoadEntities: true,
      synchronize: env.DB_SYNCHRONIZE === 'true',
      dropSchema: env.NODE_ENV === 'development', // 🔄 Recrea el schema en desarrollo
      logging: env.DB_LOGGING === 'true',
    }),
    TypeOrmModule.forFeature([User]),
    NatsModule,
    RedisModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserSeeder],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly userSeeder: UserSeeder) {}

  async onModuleInit() {
    await this.userSeeder.seed();
  }
}
