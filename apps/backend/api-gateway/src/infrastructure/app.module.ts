import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  GatewayAuthController,
  GatewayCoreController,
  GatewayAnalyticsController,
  GatewayFinancialController,
  SecurityController,
} from '@infrastructure/adapters/in/http/controllers';
import { SecurityTelemetryInterceptor } from '@infrastructure/adapters/in/http/interceptors/security-telemetry.interceptor';
import { HttpProxyService } from '@infrastructure/adapters/out/proxy/http-proxy.service';
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
    GatewayFinancialController,
    SecurityController,
  ],
  providers: [
    HttpProxyService,
    ...guardProviders,
    ...useCaseProviders,
    ...adapterProviders,
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityTelemetryInterceptor,
    },
  ],
  exports: [...guardProviders, ...useCaseProviders, ...adapterProviders],
})
export class AppModule {}
