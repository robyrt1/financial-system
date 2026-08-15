"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSession = void 0;
class UserSession {
    userId;
    email;
    roles;
    constructor(userId, email, roles = []) {
        this.userId = userId;
        this.email = email;
        this.roles = roles;
    }
}
exports.UserSession = UserSession;
