export interface ReferenceItemResponse {
    referenceItemId: number;
    referenceType: string;
    itemCode: string;
    description: string;
    metadata: ReferenceMetadata[]
}

export interface ReferenceMetadata {
    metamodelId: number;
    referenceTypeId: number;
    workspaceId: number;
    metadataName: string;
    metadata: Record<string, any>
}