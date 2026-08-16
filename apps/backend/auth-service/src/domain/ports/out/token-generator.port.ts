export interface TokenPayload {
    userId: string;
    email: string;
    roles?: string[];
}

export interface TokenGeneratorPort {
    generateAccessToken(payload: TokenPayload): string;
    generateRefreshToken(payload: TokenPayload): string;
}