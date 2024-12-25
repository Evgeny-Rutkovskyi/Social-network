import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class Settings {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 'en'})
    language_app: string;

    @Column({default: false})
    private_acc: boolean;

    @Column({default: true})
    save_stories: boolean;

    @Column({default: 'some url', nullable: true})
    avatar_url: string;

    @Column({default: false})
    is_ban: boolean;

    @Column({default: ''})
    about_user: string;
}