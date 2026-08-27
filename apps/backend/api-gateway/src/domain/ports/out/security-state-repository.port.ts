import { SecurityLogEvent } from '@domain/entities/security-log-event.entity';

export interface SecurityStateRepositoryPort {
  getFirewallActive(): Promise<boolean>;
  setFirewallActive(active: boolean): Promise<void>;
  getRiskLevel(): Promise<number>;
  setRiskLevel(level: number): Promise<void>;
  getThreatsCount(): Promise<number>;
  incrementThreatsCount(): Promise<number>;
  getRecentLogs(): Promise<SecurityLogEvent[]>;
  saveLogToHistory(event: SecurityLogEvent): Promise<void>;
}
