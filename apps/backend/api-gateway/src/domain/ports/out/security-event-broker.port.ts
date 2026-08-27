import { Observable } from 'rxjs';
import { SecurityLogEvent } from '@domain/entities/security-log-event.entity';

export interface SecurityEventBrokerPort {
  publish(event: SecurityLogEvent): Promise<void>;
  subscribe(): Observable<SecurityLogEvent>;
}
