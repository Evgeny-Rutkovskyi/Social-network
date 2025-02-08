import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Chats } from "./chats.entity";
import { User } from "./user.entity";


@Entity()
export class MemberChat{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 'user'})
    role: 'user' | 'admin';

    @Column({default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

    @Column({default: null})
    start_messages: Date;

    @Column({default: true})
    access: boolean;

    @Column({default: false})
    is_deleted: boolean;

    @ManyToOne(() => Chats, (chat) => chat.members, {onDelete: 'CASCADE'})
    chat: Chats;

    @ManyToOne(() => User, (user) => user.rooms, {onDelete: 'CASCADE'})
    user: User;
}