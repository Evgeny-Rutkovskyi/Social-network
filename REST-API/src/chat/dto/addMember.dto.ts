export class AccessToMessageDto{
    see_all_message: boolean;
}

export class AddMemberDto extends AccessToMessageDto{
    members: Array<number>;
}

export class CreateGroupSettings extends AddMemberDto{
    group_protect_add: boolean;
    chat_name: string;
}