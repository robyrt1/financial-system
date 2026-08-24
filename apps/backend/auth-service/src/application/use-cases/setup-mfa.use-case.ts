import {
  ISetupMfaUseCase,
  SetupMfaResponseDto,
} from '@domain/ports/in/setup-mfa.port';
import type { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import { InvalidCredentialsError } from '@domain/errors/auth-errors';
import { Totp } from '@infrastructure/adapters/out/security/totp';

export class SetupMfaUseCase implements ISetupMfaUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(userId: string): Promise<SetupMfaResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const secret = Totp.generateSecret();

    user.enableMfa(secret);
    await this.userRepository.save(user);

    // Standard TOTP URI format
    const qrCode = `otpauth://totp/RMTECH:${user.email}?secret=${secret}&issuer=RMTECH`;

    return {
      secret,
      qrCode,
    };
  }
}
