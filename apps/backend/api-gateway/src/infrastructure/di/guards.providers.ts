import { Provider } from '@nestjs/common';
import { GatewayAuthGuard } from '@infrastructure/adapters/in/http/guards/guards/gateway-auth.guard';

export const guardProviders: Provider[] = [
    GatewayAuthGuard,
];