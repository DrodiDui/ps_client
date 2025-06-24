import {ReferenceItemResponse} from "@/type/ReferenceItemResponse";

export interface ProjectResponse {
    projectId: number;
    projectName: string;
    workspaceId: number;
    description: string;
    createdDate: Date;
    projectType: ReferenceItemResponse;
    hasGit?: boolean
}

export interface ProjectTag {
    tagId: number;
    tagName: string;
}