import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Token } from "./token.entity";


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

    @Column({default: 'some url', nullable: true})
    avatar_url: string;

    @Column({default: false})
    is_ban: boolean;
    
    @Column()
    private: boolean;

    @OneToOne(() => Token, (token) => token.user, {cascade: true, onDelete: 'CASCADE'})
    @JoinColumn()
    token: Token;
}