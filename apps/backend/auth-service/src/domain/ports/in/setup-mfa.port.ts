export class SetupMfaResponseDto {
  secret!: string;
  qrCode!: string;
}

export interface ISetupMfaUseCase {
  execute(userId: string): Promise<SetupMfaResponseDto>;
}
