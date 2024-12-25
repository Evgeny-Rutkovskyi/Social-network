import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Token } from "./token.entity";
import { Stories } from "src/entities/stories.entity";
import { Settings } from "./settings.entity";
import { UserStoriesLikes } from "./userStoriesLikes.entity";
import { ArchiveStories } from "./archive-stories.entity";


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
    
    @OneToOne(() => Token, {cascade: true, onDelete: 'CASCADE'})
    @JoinColumn()
    token: Token;

    @OneToMany(() => Stories, (stories) => stories.user, {cascade: true})
    @JoinColumn()
    stories: Stories[];

    @OneToOne(() => Settings, {cascade: true})
    @JoinColumn()
    settings: Settings;

    @OneToMany(() => UserStoriesLikes, (like) => like.user, {cascade: true})
    storiesLikes: UserStoriesLikes[];

    @OneToMany(() => ArchiveStories, (stories) => stories.user, {cascade: true})
    archiveStories: ArchiveStories[];
}