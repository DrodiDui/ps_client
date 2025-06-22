// components/custom/tasks/TaskDetailsDialog.tsx
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskResponse } from "@/type/TaskResponse";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { History, MessageSquare } from "lucide-react";
import { useState } from "react";

interface TaskActivity {
    id: number;
    user: {
        name: string;
        avatar: string;
    };
    action: string;
    details: string;
    timestamp: Date;
}

interface TaskDetailsDialogProps {
    task: TaskResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const TaskDetailsDialog = ({ task, open, onOpenChange }: TaskDetailsDialogProps) => {
    const [newComment, setNewComment] = useState<string>("");
    const [taskActivities, setTaskActivities] = useState<TaskActivity[]>([]);

    // Загрузка активности для задачи (заглушка)
    const loadTaskActivities = (taskId: number) => {
        // В реальном приложении здесь будет запрос к API
        return [
            {
                id: 1,
                user: {
                    name: "Alex Johnson",
                    avatar: "",
                },
                action: "created",
                details: "Task created",
                timestamp: new Date(),
            },
            {
                id: 2,
                user: {
                    name: "Sam Wilson",
                    avatar: "",
                },
                action: "commented",
                details: "We need to prioritize this task for the next sprint",
                timestamp: new Date(Date.now() - 3600000),
            },
            {
                id: 3,
                user: {
                    name: "Taylor Swift",
                    avatar: "",
                },
                action: "updated",
                details: "Changed status from TODO to IN_PROGRESS",
                timestamp: new Date(Date.now() - 86400000),
            },
        ];
    };

    const handleAddComment = () => {
        if (newComment.trim() === "") return;

        const newActivity: TaskActivity = {
            id: taskActivities.length + 1,
            user: {
                name: "You", // В реальном приложении - текущий пользователь
                avatar: "",
            },
            action: "commented",
            details: newComment,
            timestamp: new Date(),
        };

        setTaskActivities([newActivity, ...taskActivities]);
        setNewComment("");
    };

    const formatDate = (dateString: string | Date) => {
        try {
            return format(new Date(dateString), "dd MMM yyyy, HH:mm");
        } catch {
            return "N/A";
        }
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

    const getUserInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
    };

    // Инициализация активности
    if (taskActivities.length === 0) {
        setTaskActivities(loadTaskActivities(task.taskId));
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[80vw] h-[90vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>{task.taskTitle}</span>
                        <Badge
                            className={cn(
                                "py-1 px-2 rounded-full font-medium",
                                getStatusColor(task.taskStatus.itemCode)
                            )}
                        >
                            {task.taskStatus.description}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Основная информация */}
                    <div className="md:col-span-2">
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                                {task.description || "No description provided"}
                            </p>
                        </div>

                        {/* Активность */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <History className="h-5 w-5" /> Activity
                            </h3>

                            <div className="space-y-4">
                                {taskActivities.map(activity => (
                                    <div key={activity.id} className="flex gap-3">
                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                            <AvatarFallback>
                                                {activity.user.name.split(" ").map(n => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium">{activity.user.name}</div>
                                            <div className="text-sm text-gray-700">{activity.details}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {formatDate(activity.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Добавление комментария */}
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" /> Add Comment
                            </h3>
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add your comment..."
                                className="mb-2"
                            />
                            <Button
                                onClick={handleAddComment}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                Add Comment
                            </Button>
                        </div>
                    </div>

                    {/* Метаданные */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-700 mb-3">Task Details</h3>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-500">Priority</div>
                                    <div>
                                        <Badge
                                            className={cn(
                                                "py-1 px-2 rounded-full font-medium",
                                                getPriorityColor(task.taskPriority.itemCode)
                                            )}
                                        >
                                            {task.taskPriority.description}
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Assignee</div>
                                    <div className="flex items-center mt-1">
                                        <Avatar className="h-8 w-8 mr-2">
                                            <AvatarImage src="" alt={task.assignee.firstName} />
                                            <AvatarFallback>
                                                {getUserInitials(task.assignee.firstName, task.assignee.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{task.assignee.firstName} {task.assignee.lastName}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Project</div>
                                    <div className="font-medium">{task.project.projectName}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Workspace</div>
                                    <div className="text-gray-700">{task.workspace.workspaceName}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Created</div>
                                    <div className="text-gray-700">{formatDate(task.createdDate)}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Owner</div>
                                    <div className="flex items-center mt-1">
                                        <Avatar className="h-6 w-6 mr-2">
                                            <AvatarImage src="" alt={task.owner.firstName} />
                                            <AvatarFallback>
                                                {getUserInitials(task.owner.firstName, task.owner.lastName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span>{task.owner.firstName} {task.owner.lastName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-700 mb-3">Actions</h3>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="outline" className="flex-1">
                                    Edit Task
                                </Button>
                                <Button variant="destructive" className="flex-1">
                                    Delete
                                </Button>
                                <Button variant="secondary" className="flex-1">
                                    Change Status
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailsDialog;