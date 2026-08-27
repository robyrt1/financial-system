import { SecurityStatus } from '@domain/entities/security-status.entity';

export interface GetSecurityStatusPort {
  execute(): Promise<SecurityStatus>;
}
