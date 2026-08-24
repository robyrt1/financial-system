import { ILogoutUseCase } from '@domain/ports/in/logout.port';
import type { CacheRepositoryPort } from '@domain/ports/out/cache-repository.port';

export class LogoutUseCase implements ILogoutUseCase {
  constructor(private readonly cacheRepository: CacheRepositoryPort) {}

  async execute(userId: string): Promise<void> {
    // Delete all session keys belonging to the user ID
    await this.cacheRepository.delPattern(`session:${userId}:*`);
  }
}
