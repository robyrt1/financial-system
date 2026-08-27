import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DI_TOKENS } from '@infrastructure/di/tokens';
import type { PublishSecurityLogPort } from '@domain/ports/in/publish-security-log.port';

@Injectable()
export class SecurityTelemetryInterceptor implements NestInterceptor {
  constructor(
    @Inject(DI_TOKENS.PUBLISH_SECURITY_LOG_PORT)
    private readonly publishSecurityLog: PublishSecurityLogPort,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const { method, url, ip } = request;

    return next.handle().pipe(
      tap(() => {
        if (method === 'POST' && url.includes('/api/v1/auth/register')) {
          this.publishSecurityLog.execute(
            'SUCCESS',
            `Nova conta corporativa criada por ${request.body?.email ?? 'desconhecido'}.`,
            ip,
          );
        } else if (
          method === 'POST' &&
          url.includes('/credit-cards') &&
          url.includes('/pay')
        ) {
          this.publishSecurityLog.execute(
            'SUCCESS',
            `Fatura de cartão quitada com sucesso. Autorização de pagamento de invoice de terminal concedida.`,
            ip,
          );
        } else if (
          method === 'PATCH' &&
          url.includes('/credit-cards') &&
          url.includes('/limit')
        ) {
          this.publishSecurityLog.execute(
            'WARNING',
            `Tentativa de alteração de limites de transação pendente de aprovação manual.`,
            ip,
          );
        }
      }),
      catchError((error) => {
        const status = error.status || 500;

        if (status === 401 || status === 403) {
          this.publishSecurityLog.execute(
            'CRITICAL',
            `Tentativa inválida de autenticação ou violação de privilégios em ${method} ${url}.`,
            ip,
            { status, errorMsg: error.message },
          );
        } else if (status === 429) {
          this.publishSecurityLog.execute(
            'WARNING',
            `Limite de requisições (rate-limit) excedido em ${url}. IP de origem monitorado.`,
            ip,
            { status },
          );
        }

        return throwError(() => error);
      }),
    );
  }
}
