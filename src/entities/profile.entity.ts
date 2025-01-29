import { Column, Entity, Index, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProfileLikes } from "./profileLikes.entity";
import { CommentsProfile } from "./commentsProfile.entity";
import { UserToProfile } from "./userToProfile.entity";



@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 0})
    qty_likes: number;

    @Column({default: null})
    group_post: Date;

    @Column({default: ''})
    about_profile: string;

    @Column({nullable: false})
    path_key: string;

    @Column({default: false})
    is_ban: boolean;

    @Column({default: null})
    @Index()
    time_ban: Date;
    
    @Column({default: () => 'CURRENT_TIMESTAMP'})
    created_at: Date;

    @Column({default: false})
    is_deleted: boolean;

    @Column({default: null})
    @Index()
    deleted_at: Date;

    @ManyToMany(() => ProfileLikes, (like) => like.profile, {cascade: true})
    likes: ProfileLikes[];

    @OneToMany(() => CommentsProfile, (comment) => comment.profile, {cascade: true})
    comments: CommentsProfile[];

    @OneToMany(() => UserToProfile, (relation) => relation.profile, {cascade: true})
    users: UserToProfile[];
}