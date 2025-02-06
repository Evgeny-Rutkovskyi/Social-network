import { createParamDecorator, ExecutionContext } from "@nestjs/common";

interface PayloadToken {
    userId: number;
    userName: string;
    email: string;
}

export const UserField = createParamDecorator(
    (userField: keyof PayloadToken, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user: PayloadToken | undefined = request.user;
        return user ? user[userField] : null;
    }
);