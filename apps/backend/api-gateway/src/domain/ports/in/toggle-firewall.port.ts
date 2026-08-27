import { SecurityStatus } from '@domain/entities/security-status.entity';

export interface ToggleFirewallPort {
  execute(): Promise<SecurityStatus>;
}
