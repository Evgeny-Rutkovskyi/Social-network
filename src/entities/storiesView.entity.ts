import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Stories } from "./stories.entity";
import { User } from "./user.entity";


@Entity()
@Unique(['stories', 'user'])
export class StoriesView {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Stories, (stories) => stories.view_user, {onDelete: 'CASCADE'})
    stories: Stories;

    @ManyToOne(() => User, (user) => user.view_story, {onDelete: 'CASCADE'})
    user: User;
}