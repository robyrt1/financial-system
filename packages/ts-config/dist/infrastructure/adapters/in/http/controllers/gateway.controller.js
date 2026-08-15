"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayController = void 0;
const common_1 = require("@nestjs/common");
const route_request_port_js_1 = require("@domain/ports/in/route-request.port.js");
const gateway_auth_guard_js_1 = require("@infrastructure/adapters/in/http/guards/guards/gateway-auth.guard.js");
let GatewayController = class GatewayController {
    routeRequestPort;
    constructor(routeRequestPort) {
        this.routeRequestPort = routeRequestPort;
    }
    async handleAuth(req, res) {
        const path = req.params[0] ?? '';
        const result = await this.routeRequestPort.execute({
            service: 'auth',
            path,
            method: req.method,
            headers: req.headers,
            body: req.body,
            query: req.query,
        });
        return res.status(result.status).json(result.data);
    }
    async handleCoreBanking(req, res) {
        const path = req.params[0] ?? '';
        const result = await this.routeRequestPort.execute({
            service: 'core-banking',
            path,
            method: req.method,
            headers: req.headers,
            body: req.body,
            query: req.query,
            userId: req.user?.userId,
        });
        return res.status(result.status).json(result.data);
    }
    async handleAnalytics(req, res) {
        const path = req.params[0] ?? '';
        const result = await this.routeRequestPort.execute({
            service: 'analytics',
            path,
            method: req.method,
            headers: req.headers,
            body: req.body,
            query: req.query,
            userId: req.user?.userId,
        });
        return res.status(result.status).json(result.data);
    }
};
exports.GatewayController = GatewayController;
__decorate([
    (0, common_1.All)('auth/*'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GatewayController.prototype, "handleAuth", null);
__decorate([
    (0, common_1.All)('core/*'),
    (0, common_1.UseGuards)(gateway_auth_guard_js_1.GatewayAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GatewayController.prototype, "handleCoreBanking", null);
__decorate([
    (0, common_1.All)('analytics/*'),
    (0, common_1.UseGuards)(gateway_auth_guard_js_1.GatewayAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GatewayController.prototype, "handleAnalytics", null);
exports.GatewayController = GatewayController = __decorate([
    (0, common_1.Controller)('api/v1'),
    __param(0, (0, common_1.Inject)(route_request_port_js_1.ROUTE_REQUEST_PORT)),
    __metadata("design:paramtypes", [Object])
], GatewayController);
