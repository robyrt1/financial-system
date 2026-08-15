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
exports.GatewayAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const validate_token_port_js_1 = require("@domain/ports/in/validate-token.port.js");
let GatewayAuthGuard = class GatewayAuthGuard {
    validateTokenPort;
    constructor(validateTokenPort) {
        this.validateTokenPort = validateTokenPort;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers['authorization'];
        const session = await this.validateTokenPort.execute(authHeader);
        req.user = {
            userId: session.userId,
            email: session.email,
            roles: session.roles,
        };
        return true;
    }
};
exports.GatewayAuthGuard = GatewayAuthGuard;
exports.GatewayAuthGuard = GatewayAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(validate_token_port_js_1.VALIDATE_TOKEN_PORT)),
    __metadata("design:paramtypes", [Object])
], GatewayAuthGuard);
