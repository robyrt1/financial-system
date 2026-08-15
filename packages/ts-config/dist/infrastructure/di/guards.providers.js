"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guardProviders = void 0;
const gateway_auth_guard_1 = require("../adapters/in/http/guards/guards/gateway-auth.guard");
exports.guardProviders = [
    gateway_auth_guard_1.GatewayAuthGuard,
];
