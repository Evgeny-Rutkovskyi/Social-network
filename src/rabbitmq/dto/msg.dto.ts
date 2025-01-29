export class IdInfoDto {
    userId: number;
    
}

export class StoriesMsgDto extends IdInfoDto {
    storiesId: number;
}

export class FileMsgDto extends IdInfoDto {
    fileId: number;
    type: 'stories' | 'post';
    subspecies: 'size' | 'square' | 'portrait' | 'landscape';
}
