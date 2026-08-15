"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const gateway_controller_1 = require("./adapters/in/http/controllers/gateway.controller");
const adapters_providers_1 = require("./di/adapters.providers");
const use_cases_providers_1 = require("./di/use-cases.providers");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const guards_providers_1 = require("./di/guards.providers");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            axios_1.HttpModule.register({ timeout: 10000 }),
        ],
        controllers: [gateway_controller_1.GatewayController],
        providers: [
            ...guards_providers_1.guardProviders,
            ...use_cases_providers_1.useCaseProviders,
            ...adapters_providers_1.adapterProviders,
        ],
        exports: [
            ...guards_providers_1.guardProviders,
            ...use_cases_providers_1.useCaseProviders,
            ...adapters_providers_1.adapterProviders,
        ]
    })
], AppModule);
