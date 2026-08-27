import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { Observable, Subject } from 'rxjs';
import { SecurityStateRepositoryPort } from '@domain/ports/out/security-state-repository.port';
import { SecurityEventBrokerPort } from '@domain/ports/out/security-event-broker.port';
import { SecurityLogEvent } from '@domain/entities/security-log-event.entity';

@Injectable()
export class RedisSecurityAdapter
  implements
    SecurityStateRepositoryPort,
    SecurityEventBrokerPort,
    OnModuleInit,
    OnModuleDestroy
{
  private redisClient!: Redis;
  private subClient!: Redis;
  private readonly securityEventsSubject = new Subject<SecurityLogEvent>();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.redisClient = new Redis({
      host,
      port,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.subClient = new Redis({
      host,
      port,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.redisClient.on('error', (error) => {
      console.warn('Redis client error:', error.message);
    });

    this.subClient.on('error', (error) => {
      console.warn('Redis sub client error:', error.message);
    });

    // Subscribe to Pub/Sub channel
    await this.subClient.subscribe('security:logs');
    this.subClient.on('message', (channel, message) => {
      if (channel === 'security:logs') {
        try {
          const raw = JSON.parse(message);
          const event = new SecurityLogEvent(
            raw.id,
            raw.timestamp,
            raw.level,
            raw.message,
            raw.sourceIp,
            raw.metadata,
          );
          this.securityEventsSubject.next(event);
        } catch (err) {
          console.error('Failed to parse security log event:', err);
        }
      }
    });

    // Initialize seed data if empty
    await this.seedInitialLogs();
  }

  async onModuleDestroy() {
    await this.subClient?.quit();
    await this.redisClient?.quit();
  }

  // --- SecurityStateRepositoryPort ---

  async getFirewallActive(): Promise<boolean> {
    const val = await this.redisClient.get('security:firewall:active');
    return val === null ? true : val === 'true';
  }

  async setFirewallActive(active: boolean): Promise<void> {
    await this.redisClient.set(
      'security:firewall:active',
      active ? 'true' : 'false',
    );
  }

  async getRiskLevel(): Promise<number> {
    const val = await this.redisClient.get('security:risk_level');
    return val === null ? 0.02 : parseFloat(val);
  }

  async setRiskLevel(level: number): Promise<void> {
    await this.redisClient.set('security:risk_level', level.toString());
  }

  async getThreatsCount(): Promise<number> {
    const val = await this.redisClient.get('security:threats_count');
    return val === null ? 0 : parseInt(val, 10);
  }

  async incrementThreatsCount(): Promise<number> {
    const count = await this.redisClient.incr('security:threats_count');
    return count;
  }

  async getRecentLogs(): Promise<SecurityLogEvent[]> {
    const rawList = await this.redisClient.lrange(
      'security:logs:history',
      0,
      49,
    );
    return rawList.map((item) => {
      const raw = JSON.parse(item);
      return new SecurityLogEvent(
        raw.id,
        raw.timestamp,
        raw.level,
        raw.message,
        raw.sourceIp,
        raw.metadata,
      );
    });
  }

  async saveLogToHistory(event: SecurityLogEvent): Promise<void> {
    await this.redisClient.lpush(
      'security:logs:history',
      JSON.stringify(event),
    );
    await this.redisClient.ltrim('security:logs:history', 0, 49);
  }

  // --- SecurityEventBrokerPort ---

  async publish(event: SecurityLogEvent): Promise<void> {
    await this.redisClient.publish('security:logs', JSON.stringify(event));
  }

  subscribe(): Observable<SecurityLogEvent> {
    return this.securityEventsSubject.asObservable();
  }

  // --- Seeding ---
  private async seedInitialLogs(): Promise<void> {
    const len = await this.redisClient.llen('security:logs:history');
    if (len === 0) {
      const seedLogs = [
        {
          id: 's1',
          level: 'INFO',
          message: 'Logs de auditoria sincronizados com backup frio.',
          timestamp: new Date(Date.now() - 300000).toLocaleTimeString('pt-BR', {
            hour12: false,
          }),
        },
        {
          id: 's2',
          level: 'WARNING',
          message: 'Acesso detectado fora do padrão geográfico habitual.',
          timestamp: new Date(Date.now() - 200000).toLocaleTimeString('pt-BR', {
            hour12: false,
          }),
        },
        {
          id: 's3',
          level: 'WARNING',
          message:
            'Tentativa de alteração de limites de transação pendente de aprovação manual.',
          timestamp: new Date(Date.now() - 100000).toLocaleTimeString('pt-BR', {
            hour12: false,
          }),
        },
        {
          id: 's4',
          level: 'SUCCESS',
          message: 'Autorização MFA concedida para exportação de dados.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false }),
        },
      ];

      for (const log of seedLogs) {
        const event = new SecurityLogEvent(
          log.id,
          log.timestamp,
          log.level as any,
          log.message,
          '10.24.45.101',
        );
        await this.saveLogToHistory(event);
      }
    }
  }
}
