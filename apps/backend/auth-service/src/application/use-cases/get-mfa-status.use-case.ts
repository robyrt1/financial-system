import { IGetMfaStatusUseCase } from '@domain/ports/in/get-mfa-status.port';
import type { UserRepositoryPort } from '@domain/ports/out/user-repository.port';

export class GetMfaStatusUseCase implements IGetMfaStatusUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string): Promise<{ mfaEnabled: boolean }> {
    const user = await this.userRepository.findById(userId);
    return {
      mfaEnabled: user ? user.mfaEnabled : false,
    };
  }
}
