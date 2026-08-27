import { Observable } from 'rxjs';
import { SecurityLogEvent } from '@domain/entities/security-log-event.entity';

export interface StreamSecurityEventsPort {
  execute(): Observable<SecurityLogEvent>;
}
