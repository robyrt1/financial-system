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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheAdapter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisCacheAdapter = class RedisCacheAdapter {
    configService;
    redisClient;
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        const host = this.configService.get('REDIS_HOST', 'localhost');
        const port = this.configService.get('REDIS_PORT', 6379);
        this.redisClient = new ioredis_1.Redis({
            host,
            port,
            lazyConnect: true,
            maxRetriesPerRequest: 3,
        });
    }
    async onModuleDestroy() {
        await this.redisClient?.quit();
    }
    async get(key) {
        return this.redisClient.get(key);
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds) {
            await this.redisClient.set(key, value, 'EX', ttlSeconds);
        }
        else {
            await this.redisClient.set(key, value);
        }
    }
    async del(key) {
        await this.redisClient.del(key);
    }
    async increment(key, ttlSeconds) {
        const multi = this.redisClient.multi();
        multi.incr(key);
        if (ttlSeconds) {
            multi.expire(key, ttlSeconds);
        }
        const results = await multi.exec();
        const [err, count] = results?.[0] ?? [null, 0];
        if (err)
            throw err;
        return Number(count);
    }
};
exports.RedisCacheAdapter = RedisCacheAdapter;
exports.RedisCacheAdapter = RedisCacheAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisCacheAdapter);
