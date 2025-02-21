import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';
import { AbstractDocument } from "./abstract.schema";


@Schema()
export class MembersChatDocument extends AbstractDocument {
    @Prop({default: 'user'})
    role: 'user' | 'admin';

    @Prop({default: Date.now})
    created_at: Date;

    @Prop({default: null})
    start_messages: Date;

    @Prop({default: true})
    access: boolean;

    @Prop({default: false})
    is_deleted: boolean;

    @Prop({ type: mongoose.Types.ObjectId, ref: 'Chat' })
    chat: mongoose.Types.ObjectId;

    @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: 'Message'}] })
    messages: mongoose.Types.ObjectId[];

    @Prop()
    user_id: number;
}


export const MembersChatSchema = SchemaFactory.createForClass(MembersChatDocument);