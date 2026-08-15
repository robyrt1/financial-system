"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCaseProviders = void 0;
const tokens_js_1 = require("@infrastructure/di/tokens.js");
const authenticate_request_use_case_js_1 = require("@application/use-cases/authenticate-request.use-case.js");
const forward_request_use_case_js_1 = require("@application/use-cases/forward-request.use-case.js");
exports.useCaseProviders = [
    {
        provide: tokens_js_1.DI_TOKENS.VALIDATE_TOKEN_PORT,
        useClass: authenticate_request_use_case_js_1.AuthenticateRequestUseCase,
    },
    {
        provide: tokens_js_1.DI_TOKENS.ROUTE_REQUEST_PORT,
        useClass: forward_request_use_case_js_1.ForwardRequestUseCase,
    },
];
