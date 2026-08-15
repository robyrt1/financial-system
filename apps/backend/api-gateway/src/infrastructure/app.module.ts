import { Module } from '@nestjs/common';
import { GatewayController } from '@infrastructure/adapters/in/http/controllers/gateway.controller';
import { adapterProviders } from '@infrastructure/di/adapters.providers';
import { useCaseProviders } from '@infrastructure/di/use-cases.providers';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { guardProviders } from './di/guards.providers';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({ timeout: 10000 }),
  ],
  controllers: [GatewayController],
  providers: [
    ...guardProviders,
    ...useCaseProviders,
    ...adapterProviders,
  ],
  exports: [
    ...guardProviders,
    ...useCaseProviders,
    ...adapterProviders,
  ]
})
export class AppModule { }
