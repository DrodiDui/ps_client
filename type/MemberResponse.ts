export interface MemberResponse {
    memberId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    avatarUrl: string;
}