import { Injectable } from "@nestjs/common";
import { AbstractRepository } from "./abstract.repository";
import { MessageDocument } from "../schemas/message.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


@Injectable()
export class MessageRepository extends AbstractRepository<MessageDocument> {
    constructor(@InjectModel(MessageDocument.name) messageModel: Model<MessageDocument>){
        super(messageModel);
    }
}