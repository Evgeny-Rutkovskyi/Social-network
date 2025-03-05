import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserService } from "../users/user.service";



@Injectable()
export class ChatAdminGuard implements CanActivate {
    constructor (private readonly userService: UserService){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const req = context.switchToHttp().getRequest();
            const userId = req.user.userId;
            const chatId = req.params.chatId;
            const access = await this.userService.guardCheckAdmin(chatId, userId);
            return access;
        } catch (error) {
            console.log('Something wrong with ChatAdminGuard', error);
            return false;
        }
    }
}