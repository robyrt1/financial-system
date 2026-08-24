import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '@infrastructure/adapters/in/http/controllers/auth.controller';
import { InternalAuthMiddleware } from '@infrastructure/adapters/in/http/middlewares/internal-auth.middleware';
import { authProviders } from '@infrastructure/di/auth.providers';
import { UserORMEntity } from './adapters/out/persistence/typeorm/user.orm-entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [UserORMEntity],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([UserORMEntity]),
  ],
  controllers: [AuthController],
  providers: [...authProviders],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(InternalAuthMiddleware).forRoutes('*');
  }
}
