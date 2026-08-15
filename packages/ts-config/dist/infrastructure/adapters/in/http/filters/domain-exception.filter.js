"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const shared_errors_1 = require("@financial-system/shared-errors");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        if (exception instanceof shared_errors_1.BaseDomainError) {
            return response.status(exception.statusCode).json({
                success: false,
                error: {
                    code: exception.code,
                    translationKey: exception.translationKey,
                    params: exception.params ?? null,
                    message: exception.message,
                    details: exception.details ?? null,
                },
                timestamp: new Date().toISOString(),
            });
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const res = exception.getResponse();
            const message = typeof res === 'string' ? res : res.message || exception.message;
            return response.status(status).json({
                success: false,
                error: {
                    code: `HTTP.${status}`,
                    translationKey: 'errors.http.generic',
                    params: null,
                    message,
                    details: null,
                },
                timestamp: new Date().toISOString(),
            });
        }
        console.error('[Unhandled Gateway Exception]', exception);
        return response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: {
                code: 'SYSTEM.INTERNAL_ERROR',
                translationKey: 'errors.system.internal_error',
                params: null,
                message: 'Ocorreu um erro interno inesperado no servidor',
                details: null,
            },
            timestamp: new Date().toISOString(),
        });
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
