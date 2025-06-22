'use client'

import {useCallback, useEffect, useState} from "react";
import {useAuth} from "@/context/AppAuthProvider";
import {useWorkspace} from "@/context/WorkspaceProvider";
import {TagResponse} from "@/type/TagResponse";
import {toast} from "sonner";

const tagItems: TagResponse[] = [
    {
        tagId: 1,
        tagName: 'bug',
        workspaceId: 1
    },
    {
        tagId: 2,
        tagName: 'feature',
        workspaceId: 1
    },
    {
        tagId: 3,
        tagName: 'bug',
        workspaceId: 2
    },
    {
        tagId: 4,
        tagName: 'feature',
        workspaceId: 2
    },
    {
        tagId: 5,
        tagName: 'bug',
        workspaceId: 3
    },
    {
        tagId: 6,
        tagName: 'feature',
        workspaceId: 3
    }
]

const TaskTagListComponent = () => {

    const { token} = useAuth()
    const { currentWorkspace } = useWorkspace()

    const [tags, setTags] = useState<TagResponse[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTags = useCallback(async () => {
        if (!currentWorkspace?.workspaceId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_GATEWAY_URL}${process.env.NEXT_PUBLIC_AGGREGATOR_SERVICE_PATH}/tasks/tags/workspaceGrouped`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'workspaceId': `${currentWorkspace.workspaceId}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to load task tags');
            }

            const data = await response.json() as TagResponse[];
            setTags(data);
        } catch (err) {
            setError('Error loading projects');
            toast.error('Error loading task tags');
        } finally {
            setLoading(false);
        }
    }, [currentWorkspace, token]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    return (
        <div>
            {!tags && (
                <span>No content</span>
            )}

            <div> add tags</div>
        </div>
    )
}

export default TaskTagListComponent