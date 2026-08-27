import { Observable } from 'rxjs';
import { StreamSecurityEventsPort } from '@domain/ports/in/stream-security-events.port';
import { SecurityEventBrokerPort } from '@domain/ports/out/security-event-broker.port';
import { SecurityLogEvent } from '@domain/entities/security-log-event.entity';

export class StreamSecurityEventsUseCase implements StreamSecurityEventsPort {
  constructor(private readonly eventBroker: SecurityEventBrokerPort) {}

  execute(): Observable<SecurityLogEvent> {
    return this.eventBroker.subscribe();
  }
}
