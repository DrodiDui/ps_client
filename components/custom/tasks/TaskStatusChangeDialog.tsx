import { useEffect, useState } from "react";
import { useAuth } from "@/context/AppAuthProvider";
import { useWorkspace } from "@/context/WorkspaceProvider";
import { ReferenceItemResponse } from "@/type/ReferenceItemResponse";
import { MemberResponse } from "@/type/MemberResponse";
import { TaskResponse } from "@/type/TaskResponse";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const baseUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
const referencePath = process.env.NEXT_PUBLIC_REFERENCE_SERVICE_PATH;
const aggregatorPath = process.env.NEXT_PUBLIC_AGGREGATOR_SERVICE_PATH;
const tasksPath = process.env.NEXT_PUBLIC_TASKS_SERVICE_PATH;

interface TaskStatusChangeDialogProps {
    task: TaskResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusChangeSuccess: (updatedTask: TaskResponse) => void;
}

const TaskStatusChangeDialogComponent = ({
                                             task,
                                             open,
                                             onOpenChange,
                                             onStatusChangeSuccess
                                         }: TaskStatusChangeDialogProps) => {
    const { token } = useAuth();
    const { currentWorkspace } = useWorkspace();
    const [statuses, setStatuses] = useState<ReferenceItemResponse[]>([]);
    const [members, setMembers] = useState<MemberResponse[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>(task.taskStatus.itemCode);
    const [selectedAssignee, setSelectedAssignee] = useState<string>(String(task.assignee.memberId));
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            loadStatuses();
            loadMembers();
            // Сбрасываем выбор при открытии
            setSelectedStatus(task.taskStatus.itemCode);
            setSelectedAssignee(String(task.assignee.memberId));
        }
    }, [open]);

    const loadStatuses = async () => {
        const response = await fetch(`${baseUrl}${referencePath}/references/items?referenceType=TASK_STATUS`, {
            headers: {Authorization: `Bearer ${token}`}
        })
        setStatuses(await response.json());
    };

    const loadMembers = async () => {
        const response = await fetch(
            `${baseUrl}${aggregatorPath}/members/available`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'workspaceId': `${currentWorkspace?.workspaceId}`
                }
            }
        );
        setMembers(await response.json());
    };

    const handleStatusChange = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(
                `${baseUrl}${tasksPath}/tasks/${task.taskId}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'workspaceId': `${currentWorkspace?.workspaceId}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        statusCode: selectedStatus,
                        assigneeId: selectedAssignee
                    })
                }
            );

            if (response.ok) {
                const updatedTask = await response.json();
                onStatusChangeSuccess(updatedTask);
            } else {
                console.error('Failed to update task status');
            }
        } catch (error) {
            console.error('Error updating task status:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Task Status</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Выбор статуса */}
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={setSelectedStatus}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((status) => (
                                    <SelectItem
                                        key={status.itemCode}
                                        value={status.itemCode}
                                    >
                                        {status.description}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Выбор исполнителя */}
                    <div>
                        <Label htmlFor="assignee">Assignee</Label>
                        <Select
                            value={selectedAssignee}
                            onValueChange={setSelectedAssignee}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select assignee" />
                            </SelectTrigger>
                            <SelectContent>
                                {members.map((member) => (
                                    <SelectItem
                                        key={member.memberId.toString()}
                                        value={member.memberId.toString()}
                                    >
                                        {member.firstName} {member.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStatusChange}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TaskStatusChangeDialogComponent;