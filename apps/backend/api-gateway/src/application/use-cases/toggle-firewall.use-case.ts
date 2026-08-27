import { ToggleFirewallPort } from '@domain/ports/in/toggle-firewall.port';
import { SecurityStateRepositoryPort } from '@domain/ports/out/security-state-repository.port';
import { SecurityEventBrokerPort } from '@domain/ports/out/security-event-broker.port';
import { SecurityStatus } from '@domain/entities/security-status.entity';
import { SecurityLogEvent } from '@domain/entities/security-log-event.entity';

export class ToggleFirewallUseCase implements ToggleFirewallPort {
  constructor(
    private readonly securityRepository: SecurityStateRepositoryPort,
    private readonly eventBroker: SecurityEventBrokerPort,
  ) {}

  async execute(): Promise<SecurityStatus> {
    const currentActive = await this.securityRepository.getFirewallActive();
    const newActive = !currentActive;
    await this.securityRepository.setFirewallActive(newActive);

    let newRiskLevel = 0.02;
    if (!newActive) {
      newRiskLevel = 0.95;
    }
    await this.securityRepository.setRiskLevel(newRiskLevel);

    const threatsCount = await this.securityRepository.getThreatsCount();

    let shieldStatus: 'PROTEGIDO' | 'ALERTA' | 'DESATIVADO' = 'PROTEGIDO';
    if (!newActive) {
      shieldStatus = 'DESATIVADO';
    } else if (newRiskLevel > 0.05 || threatsCount > 0) {
      shieldStatus = 'ALERTA';
    }

    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    const logEvent = new SecurityLogEvent(
      Math.random().toString(36).substring(7),
      timestamp,
      newActive ? 'SUCCESS' : 'CRITICAL',
      newActive
        ? 'Firewall de borda ativado pelo administrador. Proteção SecOps nominal.'
        : 'AVISO: Firewall desativado manualmente. Nível de risco de segurança elevado.',
      '127.0.0.1',
      { firewallActive: newActive },
    );
    await this.securityRepository.saveLogToHistory(logEvent);
    await this.eventBroker.publish(logEvent);

    return new SecurityStatus(
      shieldStatus,
      newRiskLevel,
      threatsCount,
      newActive,
      '10.24.45.101',
      'ECC-384',
    );
  }
}
