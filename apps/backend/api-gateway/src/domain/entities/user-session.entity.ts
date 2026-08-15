export class UserSession {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly roles: string[] = [],
  ) {}
}
