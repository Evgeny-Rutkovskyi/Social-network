import { User } from "./user.entity";
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserStoriesLikes } from "./userStoriesLikes.entity";
import { StoriesView } from "./storiesView.entity";

@Entity()
export class Stories {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: false})
    only_friend: boolean;

    @Column({default: 0})
    likes_qty: number;

    @Column({default: false})
    is_ban: boolean;

    @Column({default: null})
    @Index()
    time_ban: Date;

    @Column({default: false})
    is_deleted: boolean;

    @Column({default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

    @Column({default: null})
    @Index()
    time_deleted_forever: Date;

    @ManyToOne(() => User, (user) => user.stories, {onDelete: 'CASCADE'})
    user: User;

    @OneToMany(() => UserStoriesLikes, (like) => like.stories, {cascade: true})
    likes: UserStoriesLikes[];

    @OneToMany(() => StoriesView, (relation) => relation.stories, {cascade: true})
    view_user: StoriesView;
}