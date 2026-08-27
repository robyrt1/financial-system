export class SecurityLogEvent {
  constructor(
    public readonly id: string,
    public readonly timestamp: string,
    public readonly level: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS',
    public readonly message: string,
    public readonly sourceIp?: string,
    public readonly metadata?: Record<string, any>,
  ) {}
}
