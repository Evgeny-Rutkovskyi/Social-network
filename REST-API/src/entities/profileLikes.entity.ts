import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Profile } from "./profile.entity";


@Entity()
export class ProfileLikes {

    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.profileLikes, {onDelete: 'CASCADE'})
    user: User;

    @ManyToOne(() => Profile, (profile) => profile.likes, {onDelete: 'CASCADE'})
    profile: Profile;
}