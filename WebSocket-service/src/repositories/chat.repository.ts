import { ChatDocument } from "../schemas/chat.schema";
import { AbstractRepository } from "./abstract.repository";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class ChatRepository extends AbstractRepository<ChatDocument> {
    constructor(@InjectModel(ChatDocument.name) chatModel: Model<ChatDocument>) {
        super(chatModel);
    }
}