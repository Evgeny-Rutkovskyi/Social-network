import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";


@Entity()
export class ArchiveStories{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    path: string;

    @ManyToOne(() => User, (user) => user.archiveStories, {onDelete: 'CASCADE'})
    user: User;
}