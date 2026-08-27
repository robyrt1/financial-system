import { CreateDebtPort } from "../../../domain/ports/in/debt-in.ports";
import { DebtRepositoryPort } from "../../../domain/ports/out/debt-repository.port";
import { CreateDebtDto, DebtResponseDto } from "../../dtos/debt.dtos";
import { Debt } from "../../../domain/entities/debt.entity";

export class CreateDebtUseCase implements CreateDebtPort {
  constructor(private readonly debtRepository: DebtRepositoryPort) {}

  async execute(userId: string, data: CreateDebtDto): Promise<DebtResponseDto> {
    const debt = new Debt({
      userId,
      creditorName: data.creditorName,
      type: data.type,
      originalAmount: data.originalAmount,
      remainingBalance: data.remainingBalance,
      totalInstallments: data.totalInstallments,
      paidInstallments: data.paidInstallments,
      monthlyPayment: data.monthlyPayment,
      monthlyInterestRate: data.monthlyInterestRate,
      dueDay: data.dueDay,
      encryptedContractData: data.encryptedContractData,
    });

    const savedDebt = await this.debtRepository.save(debt);
    return {
      id: savedDebt.id as string,
      userId: savedDebt.userId,
      creditorName: savedDebt.creditorName,
      type: savedDebt.type,
      originalAmount: savedDebt.originalAmount,
      remainingBalance: savedDebt.remainingBalance,
      totalInstallments: savedDebt.totalInstallments,
      paidInstallments: savedDebt.paidInstallments,
      monthlyPayment: savedDebt.monthlyPayment,
      monthlyInterestRate: savedDebt.monthlyInterestRate,
      dueDay: savedDebt.dueDay,
      status: savedDebt.status,
      createdAt: savedDebt.createdAt,
      updatedAt: savedDebt.updatedAt,
    };
  }
}
