import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../entities/user.entity";
import { Repository } from "typeorm";


@Injectable()
export class AdminGuard implements CanActivate {
    constructor (
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const req = context.switchToHttp().getRequest();
            const potentialAdmin = await this.userRepository.findOne({where: {id: req.user.userId}, select: ['is_Admin']});
            return potentialAdmin && potentialAdmin.is_Admin;
        } catch (error) {
            console.log('Something wrong with AdminGuard');
            return false;
        }
    }
}