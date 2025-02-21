import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose'
import { AbstractDocument } from "./abstract.schema";


@Schema()
export class ChatDocument extends AbstractDocument {
    @Prop()
    chat_type: 'private' | 'group';

    @Prop({default: 'Dark theme'})
    theme: string;

    @Prop({default: 'null'})
    group_link: string;

    @Prop({default: false})
    group_protect_add: boolean;

    @Prop({default: null})
    chat_name: string;

    @Prop({default: Date.now})
    created_at: Date;

    @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: 'MembersChat' }] })
    members: mongoose.Types.ObjectId[];

    @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: 'Message' }] })
    messages: mongoose.Types.ObjectId[];
}


export const ChatSchema = SchemaFactory.createForClass(ChatDocument);