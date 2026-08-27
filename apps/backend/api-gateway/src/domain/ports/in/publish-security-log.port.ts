import { SecurityLogEvent } from '@domain/entities/security-log-event.entity';

export interface PublishSecurityLogPort {
  execute(
    level: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS',
    message: string,
    sourceIp?: string,
    metadata?: Record<string, any>,
  ): Promise<SecurityLogEvent>;
}
