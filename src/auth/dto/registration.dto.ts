import { IsBoolean, IsEmail, IsNotEmpty, IsString, Length, Max, Min } from "class-validator";

export class RegistrationUserDto {
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

    @IsBoolean()
    private: boolean;
}