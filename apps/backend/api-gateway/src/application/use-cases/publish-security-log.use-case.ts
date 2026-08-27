import { PublishSecurityLogPort } from '@domain/ports/in/publish-security-log.port';
import { SecurityEventBrokerPort } from '@domain/ports/out/security-event-broker.port';
import { SecurityStateRepositoryPort } from '@domain/ports/out/security-state-repository.port';
import { SecurityLogEvent } from '@domain/entities/security-log-event.entity';

export class PublishSecurityLogUseCase implements PublishSecurityLogPort {
  constructor(
    private readonly eventBroker: SecurityEventBrokerPort,
    private readonly securityRepository: SecurityStateRepositoryPort,
  ) {}

  async execute(
    level: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS',
    message: string,
    sourceIp?: string,
    metadata?: Record<string, any>,
  ): Promise<SecurityLogEvent> {
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const id = Math.random().toString(36).substring(7);

    const event = new SecurityLogEvent(
      id,
      timestamp,
      level,
      message,
      sourceIp,
      metadata,
    );

    if (level === 'CRITICAL') {
      await this.securityRepository.incrementThreatsCount();
      await this.securityRepository.setRiskLevel(0.48);
    } else if (level === 'WARNING') {
      await this.securityRepository.setRiskLevel(0.12);
    }

    await this.securityRepository.saveLogToHistory(event);
    await this.eventBroker.publish(event);
    return event;
  }
}
