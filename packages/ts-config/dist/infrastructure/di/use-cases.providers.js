"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCaseProviders = void 0;
const tokens_1 = require("./tokens");
const authenticate_request_use_case_1 = require("../../application/use-cases/authenticate-request.use-case");
const forward_request_use_case_1 = require("../../application/use-cases/forward-request.use-case");
exports.useCaseProviders = [
    {
        provide: tokens_1.DI_TOKENS.VALIDATE_TOKEN_PORT,
        useClass: authenticate_request_use_case_1.AuthenticateRequestUseCase,
    },
    {
        provide: tokens_1.DI_TOKENS.ROUTE_REQUEST_PORT,
        useClass: forward_request_use_case_1.ForwardRequestUseCase,
    },
];
