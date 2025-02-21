import { Injectable } from "@nestjs/common";
import { AbstractRepository } from "./abstract.repository";
import { MembersChatDocument } from "src/schemas/members-chat.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


@Injectable()
export class MembersChatRepository extends AbstractRepository<MembersChatDocument> {
    constructor(@InjectModel(MembersChatDocument.name) 
        membersChatModel: Model<MembersChatDocument>  
    ){
        super(membersChatModel);
    }
}