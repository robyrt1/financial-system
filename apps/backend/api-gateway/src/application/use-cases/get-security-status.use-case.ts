import { GetSecurityStatusPort } from '@domain/ports/in/get-security-status.port';
import { SecurityStateRepositoryPort } from '@domain/ports/out/security-state-repository.port';
import { SecurityStatus } from '@domain/entities/security-status.entity';

export class GetSecurityStatusUseCase implements GetSecurityStatusPort {
  constructor(
    private readonly securityRepository: SecurityStateRepositoryPort,
  ) {}

  async execute(): Promise<SecurityStatus> {
    const firewallActive = await this.securityRepository.getFirewallActive();
    const riskLevel = await this.securityRepository.getRiskLevel();
    const threatsCount = await this.securityRepository.getThreatsCount();

    let shieldStatus: 'PROTEGIDO' | 'ALERTA' | 'DESATIVADO' = 'PROTEGIDO';
    if (!firewallActive) {
      shieldStatus = 'DESATIVADO';
    } else if (riskLevel > 0.05 || threatsCount > 0) {
      shieldStatus = 'ALERTA';
    }

    return new SecurityStatus(
      shieldStatus,
      riskLevel,
      threatsCount,
      firewallActive,
      '10.24.45.101',
      'ECC-384',
    );
  }
}
