import { Column, Entity, Index, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Token } from "./token.entity";
import { Stories } from "./stories.entity";
import { Settings } from "./settings.entity";
import { UserStoriesLikes } from "./userStoriesLikes.entity";
import { ProfileLikes } from "./profileLikes.entity";
import { CommentsProfile } from "./commentsProfile.entity";
import { UserToProfile } from "./userToProfile.entity";
import { StoriesView } from "./storiesView.entity";
import { Exclude } from "class-transformer";
import { FollowsAndBlock } from "./followsAndBlock.entity";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    user_name: string;

    @Column({unique: true})
    email: string;

    @Column({unique: true})
    password: string;

    @Column({default: 0})
    qty_following: number;

    @Column({default: 0})
    qty_followers: number;

    @Column({default: false})
    @Exclude()
    is_Admin: boolean;

    @Column({default: false})
    is_ban: boolean;

    @Column({default: null})
    @Index()
    ban_time: Date;
    
    @OneToOne(() => Token, {cascade: true, onDelete: 'SET NULL'})
    @JoinColumn()
    token: Token;

    @OneToMany(() => Stories, (stories) => stories.user, {cascade: true})
    @JoinColumn()
    stories: Stories[];

    @OneToMany(() => FollowsAndBlock, (follow) => follow.who_follows, {cascade: true})
    @JoinColumn()
    following: FollowsAndBlock[];

    @OneToMany(() => FollowsAndBlock, (follow) => follow.user_follows, {cascade: true})
    @JoinColumn()
    followers: FollowsAndBlock[];

    @OneToOne(() => Settings, {cascade: true, onDelete: 'SET NULL'})
    @JoinColumn()
    settings: Settings;

    @OneToMany(() => UserStoriesLikes, (like) => like.user, {cascade: true})
    storiesLikes: UserStoriesLikes[];

    @ManyToMany(() => ProfileLikes, (profile) => profile.user, {cascade: true})
    profileLikes: ProfileLikes[];
    
    @OneToMany(() => CommentsProfile, (comment) => comment.user, {cascade: true})
    comments: CommentsProfile[];

    @OneToMany(() => UserToProfile, (relation) => relation.user, {cascade: true})
    profiles: UserToProfile[];

    @OneToMany(() => StoriesView, (relation) => relation.user, {cascade: true})
    view_story: StoriesView[];
}