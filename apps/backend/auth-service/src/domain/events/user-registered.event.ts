export interface UserRegisteredEventPayload {
    userId: string;
    name: string;
    email: string;
    occurredOn: Date;
}

export class UserRegisteredEvent {
    public readonly eventName = 'auth.user.registered';
    public readonly occurredOn: Date;

    constructor(
        public readonly userId: string,
        public readonly name: string,
        public readonly email: string,
    ) {
        this.occurredOn = new Date();
    }

    toJSON(): UserRegisteredEventPayload {
        return {
            userId: this.userId,
            name: this.name,
            email: this.email,
            occurredOn: this.occurredOn,
        };
    }
}