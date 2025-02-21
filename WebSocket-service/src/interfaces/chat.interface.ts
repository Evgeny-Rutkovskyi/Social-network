import { ObjectId } from "mongodb";

export interface User {
    userId: string;
    socketId: string;
}

export interface Message {
    user: User;
    message: string;
    timeSent: Date;
    chatId: string;
}

export interface JoinRoom extends User {
    chat_id: string;
}

export interface AccessInfo {
    permission: boolean;
    messages;
}

export interface EditMessage {
    user: User;
    editMessageId: string;
    newMessage: string;
    chatId: string;
}

export interface DeleteMessage {
    user: User;
    messageId: string;
    chatId: string;
}

export interface ReplyMessage extends Message{
    replyMessageId: string;
}

export interface ForwardMessage {
    message: {
        user: User;
        message: string;
        timeSent: Date;
    },
    chatsId: Array<string>;
    forward: {
        message: string;
        userId: string;
    }
}

export interface ClientToServerEvents {
    join_room: (e: JoinRoom) => void;
    message: (e: Message) => void;
    edit: (e: EditMessage) => void;
    delete: (e: DeleteMessage) => void;
    reply: (e: ReplyMessage) => void;
    forward: (e: ForwardMessage) => void;
}

export interface ServerToClientEvents {
    message: (e: Message) => void;
    last_messages: (e: ObjectId[]) => void;
    edit: (e: EditMessage) => void;
    delete: (e: {deleted_message: ObjectId}) => void;
    reply: (e: ReplyMessage) => void;
}