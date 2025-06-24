'use client'

import {useState} from "react";
import {Card} from "@/components/ui/card";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {AnimatePresence, motion} from "framer-motion";
import ProjectDetailsComponent from "@/components/custom/projects/ProjectDetails";
import {useParams} from "next/navigation";
import TaskTableComponent from "@/components/custom/tasks/TaskTable";
import {ProjectResponse} from "@/type/ProjectResponse";
import Link from "next/link";
import {LeftArrow} from "next/dist/client/components/react-dev-overlay/ui/icons/left-arrow";
import {GitMerge} from "lucide-react";

const taskWorkflowType = [
    {
        workflowId: 1,
        code: 'details',
        workflowName: 'Project details',
        icon: null
    },
    {
        workflowId: 2,
        code: 'tasks',
        workflowName: 'Project tasks',
        icon: null
    },
    {
        workflowId: 3,
        code: 'git',
        workflowName: 'Git repository',
        icon: <GitMerge/>
    },
    {
        workflowId: 4,
        code: 'settings',
        workflowName: 'Project settings',
        icon: null
    }
];

const ProjectPage = () => {
    const params = useParams<{ id: string }>()
    const [activeTab, setActiveTab] = useState('details');

    const [currentProject, setCurrentProject] = useState<ProjectResponse>()

    console.log(`Current Project in project page: ${currentProject?.projectName}`)
    console.log(`Current Project has git repo?: ${currentProject?.hasGit}`)

    const handleCurrentProject = (project: ProjectResponse) => {
        setCurrentProject({
            projectId: project.projectId,
            projectName: project.projectName,
            description: project.description,
            workspaceId: project.workspaceId,
            projectType: project.projectType,
            createdDate: project.createdDate,
            hasGit: true
        })
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <Link href={'/projects'} className={'flex flex-row items-center content-center transition-colors'}><LeftArrow/></Link>
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full sm:w-auto"
                >
                    <TabsList className="bg-gradient-to-r from-indigo-50 to-purple-50 p-1 h-auto">
                        {taskWorkflowType.map((item) => (
                            <TabsTrigger
                                key={`project-workflow-${item.workflowId}`}
                                value={`${item.code}`}
                                className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center"
                            >
                                {item.icon}
                                {item.workflowName}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2"
                >
                    {activeTab === 'details' && (
                        <ProjectDetailsComponent projectId={Number(params.id)} setCurrentProjectForUse={handleCurrentProject}/>
                    )}

                    {activeTab === 'tasks' && (
                        <TaskTableComponent currentProject={currentProject}/>
                    )}

                    {currentProject?.hasGit && activeTab === 'git' && (
                        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                            repop
                        </Card>
                    )}

                    {activeTab === 'settings' && (
                        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default ProjectPage