import { UserRegisteredEvent } from '@domain/events/user-registered.event';

export interface EventPublisherPort {
    publishUserRegistered(event: UserRegisteredEvent): Promise<void>;
}