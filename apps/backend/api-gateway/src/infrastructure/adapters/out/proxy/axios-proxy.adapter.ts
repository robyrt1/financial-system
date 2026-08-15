import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HttpProxyPort, ProxyRequestInput } from '@domain/ports/out/http-proxy.port';
import { ProxyResponseDto } from '@application/dtos/proxy-request.dto';
import { ServiceUnavailableError } from '@domain/errors/gateway-errors';

@Injectable()
export class AxiosProxyAdapter implements HttpProxyPort {
    constructor(private readonly httpService: HttpService) { }

    async forward<T = unknown>(input: ProxyRequestInput): Promise<ProxyResponseDto<T>> {
        try {
            const response = await firstValueFrom(
                this.httpService.request<T>({
                    url: input.targetUrl,
                    method: input.method,
                    headers: input.headers,
                    data: input.body,
                    params: input.params,
                    validateStatus: () => true,
                }),
            );

            return {
                data: response.data,
                status: response.status,
                headers: response.headers as Record<string, unknown>,
            };
        } catch {
            throw new ServiceUnavailableError(input.targetUrl);
        }
    }
}