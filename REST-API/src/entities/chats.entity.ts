import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MemberChat } from "./membersChat.entity";


@Entity()
export class Chats{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chat_type: 'private' | 'group';

    @Column({default: 'Dark theme'})
    theme: string;

    @Column({default: null})
    group_link: string;

    @Column({default: false})
    group_protect_add: boolean;

    @Column({default: null})
    chat_name: string;

    @Column({default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

    @OneToMany(() => MemberChat, (member) => member.chat, {cascade: true})
    members: MemberChat[];
}