import { IsBoolean, IsString, MaxLength, ValidateIf } from "class-validator";

export class ChangeSettingsDto{
    @ValidateIf(obj => obj.private_acc !== undefined)
    @IsBoolean()
    private_acc?: boolean;

    @ValidateIf(obj => obj.language_app !== undefined)
    @IsString()
    language_app?: string;
    
    @ValidateIf(obj => obj.save_stories !== undefined)
    @IsBoolean()
    save_stories?: boolean;

    @ValidateIf(obj => obj.about_user !== undefined)
    @IsString()
    @MaxLength(200)
    about_user?: string;
}