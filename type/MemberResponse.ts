import {ReferenceItemResponse} from "@/type/ReferenceItemResponse";

export interface MemberResponse {
    memberId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    memberRole: ReferenceItemResponse;
    memberStatus: ReferenceItemResponse;
    avatarUrl?: string;
    workspaceMemberRoles: string[]
}