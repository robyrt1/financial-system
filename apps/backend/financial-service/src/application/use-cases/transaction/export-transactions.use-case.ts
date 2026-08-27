import { ExportTransactionsPort } from "@domain/ports/in/export-transactions.port";
import { TransactionRepositoryPort } from "@domain/ports/out/transaction-repository.port";

export class ExportTransactionsUseCase implements ExportTransactionsPort {
  constructor(
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  async execute(
    userId: string,
    format: "csv" | "ofx",
    filterQuery: any,
  ): Promise<{ data: string; filename: string }> {
    const transactions =
      await this.transactionRepository.findAllWithoutPagination(
        userId,
        filterQuery,
      );
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .substring(0, 14);

    if (format === "csv") {
      const headers = "ID,Data,Descricao,Categoria,Tipo,Status,Valor,Tags\n";
      const rows = transactions
        .map((t) => {
          const val = t.type === "EXPENSE" ? -t.amount : t.amount;
          return `"${t.id}","${t.date}","${t.description.replace(/"/g, '""')}","${t.categoryId || ""}","${t.type}","${t.status}",${val},"${(t.tags || []).join(";")}"`;
        })
        .join("\n");

      return {
        data: headers + rows,
        filename: `extrato-${timestamp}.csv`,
      };
    } else {
      const ofxHeader = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<DTSERVER>${timestamp}
<LANGUAGE>POR
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>${timestamp}
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>BRL
<BANKTRANLIST>
<DTSTART>${filterQuery.startDate ? filterQuery.startDate.replace(/-/g, "") : "20260101"}000000
<DTEND>${filterQuery.endDate ? filterQuery.endDate.replace(/-/g, "") : "20261231"}235959
`;

      const ofxTransactions = transactions
        .map((t) => {
          const ofxType = t.type === "INCOME" ? "CREDIT" : "DEBIT";
          const val = t.type === "EXPENSE" ? -t.amount : t.amount;
          const ofxDate = t.date.replace(/-/g, "") + "000000";
          return `
<STMTTRN>
<TRNTYPE>${ofxType}
<DTPOSTED>${ofxDate}
<TRNAMT>${val.toFixed(2)}
<FITID>${t.id}
<MEMO>${t.description}
</STMTTRN>`;
        })
        .join("");

      const ofxFooter = `
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

      return {
        data: ofxHeader + ofxTransactions + ofxFooter,
        filename: `extrato-${timestamp}.ofx`,
      };
    }
  }
}
