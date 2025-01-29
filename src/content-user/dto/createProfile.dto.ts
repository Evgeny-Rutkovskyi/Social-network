export class ProfileTextDto{
    aboutProfile: string;
}

export class CreateProfileDto extends ProfileTextDto {
    subspecies: 'square' | 'portrait' | 'landscape';

    joinProfile: string;

    involvedHumanId?: Array<number>;
}