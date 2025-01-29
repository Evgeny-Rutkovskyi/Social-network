import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class PublicStoriesDto {
    @Transform((exp) => Boolean(exp.value))
    @IsBoolean()
    @IsNotEmpty()
    public: boolean;
}