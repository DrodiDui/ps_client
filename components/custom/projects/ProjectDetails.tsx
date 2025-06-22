'use client'

import {ProjectResponse} from "@/type/ProjectResponse";

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {ListChecks, Users} from 'lucide-react';

const project: ProjectResponse = {
    projectId: 1,
    projectName: 'backend project',
    workspaceId: 1,
    description: 'backend project',
    createdDate: new Date(),
    projectTags: [
        {
            tagId: 1,
            tagName: 'backend'
        }
    ],
    type: 'api'
}

const ProjectDetailsComponent = () => {

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
                {/*<Link href={`/spaces/${spaceId}/projects/${project.id}`}>
                    <Button variant="outline" className="w-full">
                        Открыть проект
                    </Button>
                </Link>*/}
            </CardContent>
        </Card>
    );
}

export default ProjectDetailsComponent;