import { Module } from '@nestjs/common';
import {
  GatewayAuthController,
  GatewayCoreController,
  GatewayAnalyticsController,
} from '@infrastructure/adapters/in/http/controllers';
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
  controllers: [
    GatewayAuthController,
    GatewayCoreController,
    GatewayAnalyticsController,
  ],
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
