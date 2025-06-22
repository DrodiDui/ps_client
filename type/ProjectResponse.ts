import {ReferenceItemResponse} from "@/type/ReferenceItemResponse";

export interface ProjectResponse {
    projectId: number;
    projectName: string;
    workspaceId: number;
    description: string;
    createdDate: Date;
    projectType: ReferenceItemResponse;
}

export interface ProjectTag {
    tagId: number;
    tagName: string;
}