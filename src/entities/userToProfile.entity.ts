import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Profile } from "./profile.entity";


@Entity()
export class UserToProfile {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.profiles, {onDelete: 'CASCADE'})
    user: User;

    @ManyToOne(() => Profile, (profile) => profile.users, {onDelete: 'CASCADE'})
    profile: Profile;
}