'use client'

import {ProjectResponse} from "@/type/ProjectResponse";
import {useCallback, useEffect, useState} from "react";
import {useWorkspace} from "@/context/WorkspaceProvider";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {ListChecks, Loader2, Trash2, Users} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import ProjectAppDialog from "@/components/custom/projects/ProjectCreatedDialog";
import {toast} from "sonner";
import {useAuth} from "@/context/AppAuthProvider";
import {ReferenceItemResponse} from "@/type/ReferenceItemResponse";
import IconRenderer from "@/components/custom/layout/IconRenderer";
import {Skeleton} from "@/components/ui/skeleton";
import {ConfirmationDialog} from "@/components/custom/ui/ConfirmationDialog";
import {AnimatePresence, motion} from "framer-motion";

const ProjectListComponent = () => {
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteProject, setDeleteProject] = useState<ProjectResponse | null>(null);

    const { currentWorkspace } = useWorkspace();
    const { token } = useAuth();

    // Оптимизированный запрос проектов
    const fetchProjects = useCallback(async () => {
        if (!currentWorkspace?.workspaceId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_GATEWAY_URL}${process.env.NEXT_PUBLIC_AGGREGATOR_SERVICE_PATH}/projects`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'workspaceId': `${currentWorkspace.workspaceId}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to load projects');
            }

            const data = await response.json() as ProjectResponse[];
            setProjects(data);
        } catch (err) {
            setError('Error loading projects');
            toast.error('Error loading projects');
        } finally {
            setLoading(false);
        }
    }, [currentWorkspace, token]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleProjectCreation = (newProject: ProjectResponse) => {
        setProjects(prev => [newProject, ...prev]);
        toast.success("Project created successfully!", {
            description: `${newProject.projectName} is now available`
        });
    };

    const getIconMetadata = (item: ReferenceItemResponse) => {
        if (!item.metadata || item.metadata.length === 0) return null;

        const workspaceMeta = item.metadata.find(m => m.workspaceId === currentWorkspace?.workspaceId);
        const globalMeta = item.metadata.find(m => m.workspaceId === null);

        const metadata = workspaceMeta?.metadata || globalMeta?.metadata || null;
        return metadata && (
            <IconRenderer
                iconName={metadata.icon}
                color={metadata.color}
                size={20}
            />
        );
    };

    const confirmDelete = (project: ProjectResponse) => {
        setDeleteProject(project);
    };

    const handleDeleteProject = async () => {
        if (!deleteProject || !token) return;

        setIsDeleting(true);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_GATEWAY_URL}${process.env.NEXT_PUBLIC_WORKSPACE_SERVICE_PATH}/projects/${deleteProject.projectId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {
                setProjects(prev => prev.filter(p => p.projectId !== deleteProject.projectId));
                toast.success("Project deleted successfully", {
                    description: `${deleteProject.projectName} has been removed`
                });
            } else {
                throw new Error('Failed to delete project');
            }
        } catch (err) {
            toast.error('Error deleting project');
        } finally {
            setIsDeleting(false);
            setDeleteProject(null);
        }
    };

    // Рендер состояния загрузки
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="h-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-6 w-3/4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full mb-4" />
                            <Skeleton className="h-4 w-3/4 mb-6" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // Рендер ошибки
    if (error) {
        return (
            <div className="text-center py-8 border rounded-lg bg-destructive/10">
                <p className="text-destructive mb-4">{error}</p>
                <Button variant="outline" onClick={fetchProjects}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <p className="text-muted-foreground text-sm">
                        {projects.length} project{projects.length !== 1 ? 's' : ''} in this workspace
                    </p>
                </div>
                <div className="flex gap-2 justify-center items-center">
                    <ProjectAppDialog onProjectCreated={handleProjectCreation} />
                </div>
            </div>

            <AnimatePresence>
                {projects.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                    >
                        {projects.map(project => (
                            <motion.div
                                key={project.projectId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                layout
                                className="h-full"
                            >
                                <Card className="hover:shadow-md transition-shadow h-full flex flex-col group">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1">
                                                    {getIconMetadata(project.projectType)}
                                                </div>
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        {project.projectName}
                                                        {/*{project && (
                                                            <Badge variant="secondary">Archived</Badge>
                                                        )}*/}
                                                    </CardTitle>
                                                    {project.description && (
                                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                            {project.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => confirmDelete(project)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive"
                                                aria-label="Delete project"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="mt-auto">
                                        <div className='flex justify-between'>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <ListChecks className="h-4 w-4"/>
                                                    0 tasks
                                                </Badge>
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <Users className="h-4 w-4"/>
                                                    0 members
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href={`/projects/${project.projectId}`}>
                                                Open Project
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        className="border-2 border-dashed rounded-xl py-12 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="text-muted-foreground mb-4">No projects yet</p>
                        <ProjectAppDialog onProjectCreated={handleProjectCreation} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Диалог подтверждения удаления */}
            <ConfirmationDialog
                open={!!deleteProject}
                onOpenChange={(open) => !open && setDeleteProject(null)}
                title={`Delete project ${deleteProject?.projectName}?`}
                description="This action cannot be undone. All project data will be permanently removed."
                confirmText={isDeleting}
                cancelText="Cancel"
                onConfirm={handleDeleteProject}
                destructive
                loading={isDeleting}
            />
        </div>
    );
};

export default ProjectListComponent;