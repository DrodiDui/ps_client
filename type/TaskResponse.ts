import {ReferenceItemResponse} from "@/type/ReferenceItemResponse";
import {ProjectResponse} from "@/type/ProjectResponse";
import {WorkspaceResponse} from "@/type/WorkspaceResponse";
import {MemberResponse} from "@/type/MemberResponse";
import {TagResponse} from "@/type/TagResponse";

export interface TaskResponse {

    taskId: number;
    taskName: string;
    taskTitle: string;
    description: string;
    taskStatus: ReferenceItemResponse;
    taskPriority: ReferenceItemResponse;
    taskType: ReferenceItemResponse;
    project: ProjectResponse;
    workspace: WorkspaceResponse;
    owner: MemberResponse;
    assignee: MemberResponse;
    createdDate: Date;
    lastModifiedDate: Date
    tags: TagResponse[]

}

export interface PageableTaskResponse {
    totalCount: number;
    tasks: TaskResponse[]
}

export interface TaskStatusResponse {
    status: ReferenceItemResponse;
    tasks: TaskResponse[]
}