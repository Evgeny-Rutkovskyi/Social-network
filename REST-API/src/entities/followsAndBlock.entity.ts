import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";


@Entity()
export class FollowsAndBlock {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: false})
    accepted: boolean;

    @Column({default: null})
    @Index()
    accepted_time: Date;

    @Column({default: false})
    best_friend: boolean;

    @Column({default: false})
    is_block: boolean;

    @ManyToOne(() => User, (follow) => follow.following, {onDelete: 'CASCADE'})
    who_follows: User;

    @ManyToOne(() => User, (follow) => follow.followers, {onDelete: 'CASCADE'})
    user_follows: User;
}