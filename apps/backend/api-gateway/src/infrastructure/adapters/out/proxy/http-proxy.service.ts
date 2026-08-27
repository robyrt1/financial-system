import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createProxyMiddleware,
  fixRequestBody,
  Options,
} from 'http-proxy-middleware';
import type { Request, Response } from 'express';

@Injectable()
export class HttpProxyService {
  private readonly financialProxy: ReturnType<typeof createProxyMiddleware>;

  constructor(private readonly configService: ConfigService) {
    const financialUrl = this.configService.getOrThrow<string>(
      'FINANCIAL_SERVICE_URL',
    );

    const options: Options = {
      target: financialUrl,
      changeOrigin: true,
      pathRewrite: {
        '^/api/v1': '/v1',
      },
      on: {
        proxyReq: (proxyReq, req: any) => {
          proxyReq.removeHeader('x-user-id');
          proxyReq.removeHeader('x-user-role');
          proxyReq.removeHeader('x-tenant-id');

          if (req.user) {
            const userId = req.user.userId || req.user.id || '';
            const userRole = req.user.roles?.[0] || req.user.role || '';

            proxyReq.setHeader('x-user-id', userId);
            proxyReq.setHeader('x-user-role', userRole);
          }

          proxyReq.removeHeader('Authorization');

          fixRequestBody(proxyReq, req);
        },
        error: (err, _req, res: any) => {
          console.error('Proxy routing downstream error:', err);
          if (!res.headersSent) {
            res.status(502).json({
              success: false,
              error: {
                code: 'GATEWAY.BAD_GATEWAY',
                translationKey: 'errors.gateway.bad_gateway',
                message: 'Downstream microservice connection timeout or failed',
              },
              timestamp: new Date().toISOString(),
            });
          }
        },
      },
    };

    this.financialProxy = createProxyMiddleware(options);
  }

  proxyFinancial(req: Request, res: Response) {
    // Express reverse proxy execution
    this.financialProxy(req, res, (err: any) => {
      if (err && !res.headersSent) {
        res.status(502).json({
          success: false,
          error: {
            code: 'GATEWAY.BAD_GATEWAY',
            translationKey: 'errors.gateway.bad_gateway',
            message: 'Connection failed',
          },
          timestamp: new Date().toISOString(),
        });
      }
    });
  }
}
