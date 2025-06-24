'use client'

import TaskCreateDialogComponent from "@/components/custom/tasks/TaskCreateDialog";
import {useEffect, useState} from "react";
import {PageableTaskResponse, TaskResponse} from "@/type/TaskResponse";
import {toast} from "sonner";
import {useAuth} from "@/context/AppAuthProvider";
import {useWorkspace} from "@/context/WorkspaceProvider";
import {ProjectResponse} from "@/type/ProjectResponse";
import {format} from "date-fns";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {ChevronLeft, ChevronRight, Filter, List, Settings, Trash, User} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {ScrollArea} from "@/components/ui/scroll-area";
import TaskDetailsDialog from "@/components/custom/tasks/TaskDetails";

interface TaskTableComponentProps {
    currentProject?: ProjectResponse
}

const TaskTableComponent = ({currentProject}: TaskTableComponentProps) => {
    const {token} = useAuth();
    const {currentWorkspace} = useWorkspace();

    const [offset, setOffset] = useState<number>(0);
    const [limit, setLimit] = useState<number>(10);
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
    const [tasks, setTasks] = useState<TaskResponse[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [columnVisibility, setColumnVisibility] = useState({
        status: true,
        priority: true,
        assignee: true,
        project: true,
        createdDate: true,
    });
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);

    const baseUrl = `${process.env.NEXT_PUBLIC_GATEWAY_URL}`;

    useEffect(() => {
        loadProjects();
        loadTasks();
    }, [offset, limit, selectedProjects]);

    const loadProjects = async () => {
        try {
            const response = await fetch(
                `${baseUrl}${process.env.NEXT_PUBLIC_AGGREGATOR_SERVICE_PATH}/projects`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        workspaceId: `${currentWorkspace?.workspaceId}`,
                    },
                }
            );
            setProjects(await response.json() as ProjectResponse[]);
        } catch (error) {
            toast.error("Failed to load projects");
            console.error(error);
        }
    };

    const loadTasks = async () => {
        setLoading(true);
        try {
            const tasksUrl = `${baseUrl}${process.env.NEXT_PUBLIC_AGGREGATOR_SERVICE_PATH}`;
            let projectsParam
            if (currentProject) {
                projectsParam = `&projects=${currentProject.projectId}`
            } else {
                projectsParam = selectedProjects.length > 0
                    ? `&projects=${selectedProjects.join(",")}`
                    : "";
            }

            console.log(`tasks request params: ${projectsParam}`)

            const response = await fetch(
                `${tasksUrl}/tasks?offset=${offset}&limit=${limit}${projectsParam}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        workspaceId: `${currentWorkspace?.workspaceId}`,
                    },
                }
            );

            const data: PageableTaskResponse = await response.json();
            setTasks(data.tasks);
            setTotalCount(data.totalCount);
        } catch (error) {
            toast.error("Failed to load tasks");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTaskCreate = (newTask: TaskResponse) => {
        setTasks(prev => [newTask, ...prev]);
        toast.success("Task created successfully!", {
            description: `${newTask.taskTitle} is now available`
        });
    };

    const toggleProjectFilter = (projectId: number) => {
        setSelectedProjects(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
        setOffset(0);
    };

    const nextPage = () => {
        if (offset + limit < totalCount) {
            setOffset(offset + limit);
        }
    };

    const prevPage = () => {
        if (offset - limit >= 0) {
            setOffset(offset - limit);
        }
    };

    const formatDate = (dateString: string | Date) => {
        try {
            return format(new Date(dateString), "dd MMM yyyy");
        } catch {
            return "N/A";
        }
    };

    const getUserInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
    };

    const getStatusColor = (statusCode: string) => {
        switch (statusCode) {
            case 'ACTIVE':
                return "bg-blue-100 text-blue-800"; // To Do
            case 'IN_PROGRESS':
                return "bg-yellow-100 text-yellow-800"; // In Progress
            case 'DONE':
                return "bg-green-100 text-green-800"; // Done
            case 'BACKLOG"':
                return "bg-red-100 text-red-800"; // Blocked
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getPriorityColor = (priorityCode: string) => {
        switch (priorityCode) {
            case 'LOW':
                return "bg-gray-100 text-gray-800"; // Low
            case 'NORMAL':
                return "bg-blue-100 text-blue-800"; // Medium
            case 'HIGH':
                return "bg-yellow-100 text-yellow-800"; // High
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleTaskSelect = (task: TaskResponse) => {
        setSelectedTask(task);
    };

    return (
        <div className="flex flex-col space-y-4">
            {/* Header with controls */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
                <div
                    className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
                        <p className="text-gray-600">
                            {totalCount} tasks in {currentProject ? currentProject.projectName : currentWorkspace?.workspaceName}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <div className="flex gap-2">
                            <Tabs
                                value={viewMode}
                                onValueChange={(value) => setViewMode(value as 'table' | 'card')}
                                className="mr-2"
                            >
                                <TabsList>
                                    <TabsTrigger value="table">
                                        <List className="h-4 w-4 mr-1"/> Table
                                    </TabsTrigger>
                                    <TabsTrigger value="card">
                                        <User className="h-4 w-4 mr-1"/> Cards
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {!currentProject ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            <Filter className="h-4 w-4 mr-1"/> Projects
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
                                        {projects.map(project => (
                                            <DropdownMenuCheckboxItem
                                                key={project.projectId}
                                                checked={selectedProjects.includes(project.projectId)}
                                                onCheckedChange={() => toggleProjectFilter(project.projectId)}
                                            >
                                                {project.projectName}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button variant={"secondary"}>{currentProject?.projectName}</Button>
                            )}


                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Settings className="h-4 w-4 mr-1"/> Columns
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {Object.entries(columnVisibility).map(([key, value]) => (
                                        <DropdownMenuCheckboxItem
                                            key={key}
                                            checked={value}
                                            onCheckedChange={() =>
                                                setColumnVisibility({...columnVisibility, [key]: !value})
                                            }
                                        >
                                            {key.charAt(0).toUpperCase() + key.slice(1)}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <TaskCreateDialogComponent onCreateTask={handleTaskCreate} defaultProject={currentProject}/>
                    </div>
                </div>
            </div>

            {/* Task View */}
            {viewMode === 'table' ? (
                // Table View
                <div className="rounded-lg border shadow-sm overflow-hidden">
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-700">
                            <thead
                                className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-semibold">Task</th>
                                {columnVisibility.status &&
                                    <th scope="col" className="px-6 py-3 font-semibold">Status</th>}
                                {columnVisibility.priority &&
                                    <th scope="col" className="px-6 py-3 font-semibold">Priority</th>}
                                {columnVisibility.assignee &&
                                    <th scope="col" className="px-6 py-3 font-semibold">Assignee</th>}
                                {columnVisibility.project &&
                                    <th scope="col" className="px-6 py-3 font-semibold">Project</th>}
                                {columnVisibility.createdDate &&
                                    <th scope="col" className="px-6 py-3 font-semibold">Created</th>}
                                <th scope="col" className="px-6 py-3 font-semibold">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                Array.from({length: 5}).map((_, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <Skeleton className="h-4 w-3/4"/>
                                            <Skeleton className="h-3 w-1/2 mt-1"/>
                                        </td>
                                        {columnVisibility.status &&
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-16"/></td>}
                                        {columnVisibility.priority &&
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-16"/></td>}
                                        {columnVisibility.assignee &&
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-6 rounded-full"/></td>}
                                        {columnVisibility.project &&
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-24"/></td>}
                                        {columnVisibility.createdDate &&
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-20"/></td>}
                                        <td className="px-6 py-4">
                                            <Skeleton className="h-4 w-20"/>
                                        </td>
                                    </tr>
                                ))
                            ) : tasks.length > 0 ? (
                                tasks.map(task => (
                                    <tr
                                        key={task.taskId}
                                        className="bg-white border-b hover:bg-indigo-50 transition-colors cursor-pointer"
                                        onClick={() => handleTaskSelect(task)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{task.taskTitle}</div>
                                            <div className="text-gray-600 text-sm mt-1">{task.taskName}</div>
                                        </td>

                                        {columnVisibility.status && (
                                            <td className="px-6 py-4">
                                                <Badge
                                                    className={cn(
                                                        "py-1 px-2 rounded-full font-medium",
                                                        getStatusColor(task.taskStatus.itemCode)
                                                    )}
                                                >
                                                    {task.taskStatus.description}
                                                </Badge>
                                            </td>
                                        )}

                                        {columnVisibility.priority && (
                                            <td className="px-6 py-4">
                                                <Badge
                                                    className={cn(
                                                        "py-1 px-2 rounded-full font-medium",
                                                        getPriorityColor(task.taskPriority.itemCode)
                                                    )}
                                                >
                                                    {task.taskPriority.description}
                                                </Badge>
                                            </td>
                                        )}

                                        {columnVisibility.assignee && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Avatar className="h-8 w-8 border-2 border-indigo-200">
                                                        <AvatarImage src="" alt={task.assignee.firstName}/>
                                                        <AvatarFallback className="bg-indigo-500 text-white">
                                                            {getUserInitials(task.assignee.firstName, task.assignee.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="ml-3">
                                                        <div className="font-medium">
                                                            {task.assignee.firstName} {task.assignee.lastName}
                                                        </div>
                                                        <div
                                                            className="text-gray-500 text-xs">{task.assignee.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.project && (
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{task.project.projectName}</div>
                                                <div
                                                    className="text-gray-500 text-sm">{task.workspace.workspaceName}</div>
                                            </td>
                                        )}

                                        {columnVisibility.createdDate && (
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{formatDate(task.createdDate)}</div>
                                                <div className="text-gray-500 text-sm">by {task.owner.firstName}</div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 flex gap-2 items-center content-center justify-center" onClick={e => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon">
                                                <Settings className="h-4 w-4"/>
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Trash className="h-4 w-4 text-red-500"/>
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-24 text-center">
                                        <div className="text-gray-500 text-lg">No tasks found</div>
                                        <div className="mt-4">
                                            <Button
                                                onClick={() => {
                                                    setSelectedProjects([]);
                                                    setOffset(0);
                                                    loadTasks();
                                                }}
                                                className="bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Reset filters
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 border-t">
                        <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                            Showing{" "}
                            <span className="font-semibold text-gray-800">
                                {offset + 1}-{Math.min(offset + limit, totalCount)}
                            </span>{" "}
                            of <span className="font-semibold text-gray-800">{totalCount}</span> tasks
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={prevPage}
                                disabled={offset === 0 || loading}
                                className="border-gray-300"
                            >
                                <ChevronLeft className="h-4 w-4"/>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={nextPage}
                                disabled={offset + limit >= totalCount || loading}
                                className="border-gray-300"
                            >
                                <ChevronRight className="h-4 w-4"/>
                            </Button>
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="border rounded p-1 text-sm bg-white"
                                disabled={loading}
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>
                    </div>
                </div>
            ) : (
                <ScrollArea className="h-[calc(100vh-220px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                        {loading ? (
                            Array.from({length: 6}).map((_, index) => (
                                <Card key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <CardHeader>
                                        <Skeleton className="h-5 w-3/4"/>
                                        <Skeleton className="h-4 w-1/2 mt-1"/>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center mt-2">
                                            <Skeleton className="h-6 w-6 rounded-full"/>
                                            <Skeleton className="h-4 w-24 ml-2"/>
                                        </div>
                                        <div className="mt-4 flex space-x-2">
                                            <Skeleton className="h-6 w-16"/>
                                            <Skeleton className="h-6 w-16"/>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : tasks.length > 0 ? (
                            tasks.map(task => (
                                <Card
                                    key={task.taskId}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleTaskSelect(task)}
                                >
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg font-bold text-gray-900">
                                            {task.taskTitle}
                                        </CardTitle>
                                        <p className="text-gray-600 text-sm">{task.taskName}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center">
                                            <Avatar className="h-8 w-8 border-2 border-indigo-200">
                                                <AvatarImage src="" alt={task.assignee.firstName}/>
                                                <AvatarFallback className="bg-indigo-500 text-white">
                                                    {getUserInitials(task.assignee.firstName, task.assignee.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="ml-3">
                                                <div className="font-medium">
                                                    {task.assignee.firstName} {task.assignee.lastName}
                                                </div>
                                                <div className="text-gray-500 text-xs">{task.assignee.email}</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Badge
                                                className={cn(
                                                    "py-1 px-2 rounded-full font-medium",
                                                    getStatusColor(task.taskStatus.itemCode)
                                                )}
                                            >
                                                {task.taskStatus.description}
                                            </Badge>

                                            <Badge
                                                className={cn(
                                                    "py-1 px-2 rounded-full font-medium",
                                                    getPriorityColor(task.taskPriority.itemCode)
                                                )}
                                            >
                                                {task.taskPriority.description}
                                            </Badge>

                                            <Badge variant="outline" className="py-1 px-2">
                                                {task.project.projectName}
                                            </Badge>
                                        </div>

                                        <div className="mt-4 flex justify-between items-center">
                                            <div className="text-gray-500 text-sm">
                                                Created: {formatDate(task.createdDate)}
                                            </div>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarFallback
                                                                className="bg-purple-500 text-white text-xs">
                                                                {getUserInitials(task.owner.firstName, task.owner.lastName)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Created by {task.owner.firstName} {task.owner.lastName}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <div className="text-gray-500 text-lg">No tasks found</div>
                                <div className="mt-4">
                                    <Button
                                        onClick={() => {
                                            setSelectedProjects([]);
                                            setOffset(0);
                                            loadTasks();
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Reset filters
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            )}

            {/* Диалог деталей задачи */}
            {selectedTask && (
                <TaskDetailsDialog
                    task={selectedTask}
                    open={!!selectedTask}
                    onOpenChange={(open) => !open && setSelectedTask(null)}
                />
            )}
        </div>
    );
};

export default TaskTableComponent;