export interface IGetMfaStatusUseCase {
  execute(userId: string): Promise<{ mfaEnabled: boolean }>;
}
