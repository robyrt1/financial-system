import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from '@infrastructure/adapters/in/http/controllers/auth.controller';
import { InternalAuthMiddleware } from '@infrastructure/adapters/in/http/middlewares/internal-auth.middleware';
import { authProviders } from '@infrastructure/di/auth.providers';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AuthController],
  providers: [...authProviders],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(InternalAuthMiddleware).forRoutes('*');
  }
}