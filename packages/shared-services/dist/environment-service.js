"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentService = void 0;
const node_process_1 = require("node:process");
class EnvironmentService {
    get(key) {
        const value = node_process_1.env[key];
        return value ? value : undefined;
    }
    getOrThrow(key, key_default) {
        const value = this.get(key);
        if (!value) {
            if (!key_default) {
                throw new Error(`Environment variable ${key} is not defined`);
            }
            return key_default;
        }
        return value;
    }
}
exports.EnvironmentService = EnvironmentService;
