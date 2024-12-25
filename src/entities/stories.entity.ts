import { User } from "./user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserStoriesLikes } from "./userStoriesLikes.entity";

@Entity()
export class Stories {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: false})
    only_friend: boolean;

    @Column({default: 0})
    likes_qty: number;

    @Column({default: false})
    status_ban: boolean;

    @ManyToOne(() => User, (user) => user.stories, {onDelete: 'CASCADE'})
    user: User;

    @OneToMany(() => UserStoriesLikes, (like) => like.stories, {cascade: true})
    likes: UserStoriesLikes[];
}