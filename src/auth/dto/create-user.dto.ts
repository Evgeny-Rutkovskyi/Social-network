import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class UserDtoForLoginOrUpdate {
    @IsString({message: 'Username must contain only letters'})
    userName?: string;

    @IsEmail()
    @IsString()
    email?: string;

    @IsNotEmpty()
    @IsString()
    @Length(6, 15)
    password: string;
}

export class EmailDto extends UserDtoForLoginOrUpdate {
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsEmail()
    @IsString()
    newEmail: string;
}

export class UserNameDto extends UserDtoForLoginOrUpdate {
    @IsString({message: 'Username must contain only letters'})
    @IsNotEmpty()
    userName: string;

    @IsNotEmpty()
    @IsString({message: 'Username must contain only letters'})
    newUserName: string;
}