import { Provider } from '@nestjs/common';
import { DI_TOKENS } from '@infrastructure/di/tokens';
import { AuthenticateRequestUseCase } from '@application/use-cases/authenticate-request.use-case';
import { ForwardRequestUseCase } from '@application/use-cases/forward-request.use-case';
import { GetSecurityStatusUseCase } from '@application/use-cases/get-security-status.use-case';
import { ToggleFirewallUseCase } from '@application/use-cases/toggle-firewall.use-case';
import { StreamSecurityEventsUseCase } from '@application/use-cases/stream-security-events.use-case';
import { PublishSecurityLogUseCase } from '@application/use-cases/publish-security-log.use-case';
import { TokenVerifierPort } from '@domain/ports/out/token-verifier.port';
import { HttpProxyPort } from '@domain/ports/out/http-proxy.port';
import { SecurityStateRepositoryPort } from '@domain/ports/out/security-state-repository.port';
import { SecurityEventBrokerPort } from '@domain/ports/out/security-event-broker.port';
import { EnvironmentService } from '@financial-system/shared-services';

export const useCaseProviders: Provider[] = [
  {
    provide: DI_TOKENS.VALIDATE_TOKEN_PORT,
    useFactory: (tokenVerifier: TokenVerifierPort) =>
      new AuthenticateRequestUseCase(tokenVerifier),
    inject: [DI_TOKENS.TOKEN_VERIFIER_PORT],
  },
  {
    provide: DI_TOKENS.ROUTE_REQUEST_PORT,
    useFactory: (proxyAdapter: HttpProxyPort) =>
      new ForwardRequestUseCase(proxyAdapter, new EnvironmentService()),
    inject: [DI_TOKENS.HTTP_PROXY_PORT],
  },
  {
    provide: DI_TOKENS.GET_SECURITY_STATUS_PORT,
    useFactory: (repo: SecurityStateRepositoryPort) =>
      new GetSecurityStatusUseCase(repo),
    inject: [DI_TOKENS.SECURITY_STATE_REPOSITORY_PORT],
  },
  {
    provide: DI_TOKENS.TOGGLE_FIREWALL_PORT,
    useFactory: (
      repo: SecurityStateRepositoryPort,
      broker: SecurityEventBrokerPort,
    ) => new ToggleFirewallUseCase(repo, broker),
    inject: [
      DI_TOKENS.SECURITY_STATE_REPOSITORY_PORT,
      DI_TOKENS.SECURITY_EVENT_BROKER_PORT,
    ],
  },
  {
    provide: DI_TOKENS.STREAM_SECURITY_EVENTS_PORT,
    useFactory: (broker: SecurityEventBrokerPort) =>
      new StreamSecurityEventsUseCase(broker),
    inject: [DI_TOKENS.SECURITY_EVENT_BROKER_PORT],
  },
  {
    provide: DI_TOKENS.PUBLISH_SECURITY_LOG_PORT,
    useFactory: (
      broker: SecurityEventBrokerPort,
      repo: SecurityStateRepositoryPort,
    ) => new PublishSecurityLogUseCase(broker, repo),
    inject: [
      DI_TOKENS.SECURITY_EVENT_BROKER_PORT,
      DI_TOKENS.SECURITY_STATE_REPOSITORY_PORT,
    ],
  },
];
