import {
  Controller,
  Get,
  Post,
  Sse,
  Inject,
  HttpCode,
  HttpStatus,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DI_TOKENS } from '@infrastructure/di/tokens';
import type { GetSecurityStatusPort } from '@domain/ports/in/get-security-status.port';
import type { ToggleFirewallPort } from '@domain/ports/in/toggle-firewall.port';
import type { StreamSecurityEventsPort } from '@domain/ports/in/stream-security-events.port';
import type { SecurityStateRepositoryPort } from '@domain/ports/out/security-state-repository.port';

@ApiTags('Cybersecurity & Audit')
@Controller('api/v1/security')
export class SecurityController {
  constructor(
    @Inject(DI_TOKENS.GET_SECURITY_STATUS_PORT)
    private readonly getSecurityStatusPort: GetSecurityStatusPort,
    @Inject(DI_TOKENS.TOGGLE_FIREWALL_PORT)
    private readonly toggleFirewallPort: ToggleFirewallPort,
    @Inject(DI_TOKENS.STREAM_SECURITY_EVENTS_PORT)
    private readonly streamSecurityEventsPort: StreamSecurityEventsPort,
    @Inject(DI_TOKENS.SECURITY_STATE_REPOSITORY_PORT)
    private readonly securityRepository: SecurityStateRepositoryPort,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Get current security status and recent audit logs',
  })
  async getStatus() {
    const status = await this.getSecurityStatusPort.execute();
    const recentLogs = await this.securityRepository.getRecentLogs();
    return {
      status,
      recentLogs,
    };
  }

  @Post('firewall/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle the application firewall status' })
  async toggleFirewall() {
    return this.toggleFirewallPort.execute();
  }

  @Sse('events/stream')
  @ApiOperation({
    summary: 'Server-Sent Events stream of real-time security events',
  })
  streamEvents(): Observable<MessageEvent> {
    return this.streamSecurityEventsPort.execute().pipe(
      map(
        (event) =>
          ({
            data: event,
          }) as MessageEvent,
      ),
    );
  }
}
