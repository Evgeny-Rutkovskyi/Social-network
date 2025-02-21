import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose'
import { AbstractDocument } from "./abstract.schema";


@Schema()
export class MessageDocument extends AbstractDocument{
    @Prop()
    message: string;

    @Prop()
    time_sent: Date;

    @Prop({default: false})
    edited: boolean;

    @Prop({default: 0})
    qty_edit: number;

    @Prop({default: null})
    reply_id: mongoose.Types.ObjectId;

    @Prop({default: null})
    forward_who_id: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Types.ObjectId, ref: 'Chat' })
    chat: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Types.ObjectId, ref: 'MembersChat' })
    user: mongoose.Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(MessageDocument);