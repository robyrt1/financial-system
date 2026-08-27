import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface InternalUserContext {
  userId: string;
  userRole: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): InternalUserContext => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.headers["x-user-id"] as string;
    const userRole = request.headers["x-user-role"] as string;

    return {
      userId: userId || "",
      userRole: userRole || "",
    };
  },
);
