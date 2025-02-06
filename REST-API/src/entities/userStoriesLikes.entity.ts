import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Stories } from "./stories.entity";


@Entity()
export class UserStoriesLikes {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.storiesLikes, {onDelete: 'CASCADE'})
    user: User;

    @ManyToOne(() => Stories, (stories) => stories.likes, {onDelete: 'CASCADE'})
    stories: Stories;
}