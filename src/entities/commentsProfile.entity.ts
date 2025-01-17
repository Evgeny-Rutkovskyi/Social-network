import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Profile } from "./profile.entity";


@Entity()
export class CommentsProfile {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: null})
    parentId: number;

    @Column({nullable: false})
    comment: string;

    @Column({default: 0})
    likes_qty: number;

    @Column({default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

    @Column({default: false})
    deleted_with_profile: boolean;

    @Column({default: false})
    is_ban: boolean;

    @Column({default: null})
    @Index()
    time_ban: Date;

    @ManyToOne(() => User, (user) => user.comments, {onDelete: 'CASCADE'})
    user: User;

    @ManyToOne(() => Profile, (profile) => profile.comments, {onDelete: 'CASCADE'})
    profile: Profile

}