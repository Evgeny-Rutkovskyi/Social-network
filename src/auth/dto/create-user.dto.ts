import { IsEmail, IsNotEmpty, IsString, Length, ValidateIf } from "class-validator";

export class UserDtoForLoginOrUpdate {
    @ValidateIf(dto => dto.userName !== undefined)
    @IsString({message: 'Username must contain only letters'})
    userName?: string;

    @ValidateIf(obj => obj.email !== undefined)
    @IsEmail()
    @IsString()
    email?: string;

    @IsNotEmpty()
    @IsString()
    @Length(6, 15)
    password: string;
}

export class EmailLoginDto extends UserDtoForLoginOrUpdate {
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;
}

export class UserNameLoginDto extends UserDtoForLoginOrUpdate {
    @IsString({message: 'Username must contain only letters'})
    @IsNotEmpty()
    userName: string;
}

export class newEmailDto extends EmailLoginDto{
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    newEmail: string;
}

export class newUserNameDto extends UserNameLoginDto{
    @IsNotEmpty()
    @IsString({message: 'Username must contain only letters'})
    newUserName: string;
}