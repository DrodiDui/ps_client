import {MemberResponse} from "@/type/MemberResponse";

export interface WorkspaceResponse {
    workspaceId: number;
    workspaceName: string;
    description: string;
    createdDate: Date;
    owner: MemberResponse;
}

export interface PageableWorkspaceResponse {
    totalCount: number;
    workspaces: WorkspaceResponse[]
}