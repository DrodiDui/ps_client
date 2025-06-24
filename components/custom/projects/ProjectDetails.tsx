'use client'

import {ProjectResponse} from "@/type/ProjectResponse";

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {ListChecks, Users} from 'lucide-react';
import {useAuth} from "@/context/AppAuthProvider";
import {useWorkspace} from "@/context/WorkspaceProvider";
import {useEffect, useState} from "react";

interface ProjectDetailsComponentProps {
    projectId: number;
    setCurrentProjectForUse?: (currentProject: ProjectResponse) => void
}

const ProjectDetailsComponent = ({projectId, setCurrentProjectForUse}: ProjectDetailsComponentProps) => {

    const { token } = useAuth()
    const { currentWorkspace } = useWorkspace()

    const [project, setProject] = useState<ProjectResponse>()

    const baseUrl = process.env.NEXT_PUBLIC_GATEWAY_URL
    const aggregatorPath = process.env.NEXT_PUBLIC_AGGREGATOR_SERVICE_PATH

    const loadProject = async (projectId: number) => {
        console.log(`${projectId}`)
        const response = await fetch(`${baseUrl}${aggregatorPath}/projects/${projectId}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`,
                "workspaceId": `${currentWorkspace?.workspaceId}`
            }
        })
        let loadedProject = await response.json();
        setProject(loadedProject)
        setCurrentProjectForUse && setCurrentProjectForUse(loadedProject)
    }

    useEffect(() => {
        loadProject(projectId)
    }, []);



    if (!project) {
        return <div>
            No content
        </div>
    }

    return (
        <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                        {/*{getIcon()}*/}
                        {project.projectName}
                    </CardTitle>
                    {/*<Badge variant="secondary">{getTypeLabel()}</Badge>*/}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                    {project.description}
                </p>
            </CardHeader>
            <CardContent className="mt-auto">
                <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <ListChecks className="h-4 w-4" />
                         задач
                    </Badge>
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                         участников
                    </Badge>
                    <Badge variant="outline">
                        Создан: {new Date(project.createdDate).toLocaleDateString()}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}

export default ProjectDetailsComponent;