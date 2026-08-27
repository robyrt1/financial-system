export class SecurityStatus {
  constructor(
    public readonly shieldStatus: 'PROTEGIDO' | 'ALERTA' | 'DESATIVADO',
    public readonly riskLevel: number,
    public readonly threatsCount: number,
    public readonly firewallActive: boolean,
    public readonly gatewayIp: string,
    public readonly sslEncryption: string,
  ) {}
}
