import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class DeleteAccountDto {
    @IsNotEmpty()
    @IsString({message: 'Username must contain only letters'})
    userName: string;

    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(6, 15)
    password: string;
}

export class changePassword extends DeleteAccountDto {
    @IsNotEmpty()
    @IsString()
    @Length(6, 15)
    newPassword: string;
}