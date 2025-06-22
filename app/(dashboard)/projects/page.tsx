'use client'

import {useWorkspace} from "@/context/WorkspaceProvider";
import ProjectListComponent from "@/components/custom/projects/ProjectList";

const ProjectsPage = () => {

    const { currentWorkspace } = useWorkspace()

    console.log(` Workspace: ${currentWorkspace?.workspaceName}`)

    return (
        <div>
            <ProjectListComponent/>
        </div>
    )
}

export default ProjectsPage