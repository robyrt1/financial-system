export interface EventPublisherPort {
  publish(routingKey: string, payload: unknown): Promise<void>;
}
