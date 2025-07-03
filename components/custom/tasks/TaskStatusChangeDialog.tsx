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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
const referencePath = process.env.NEXT_PUBLIC_REFERENCE_SERVICE_PATH;
const aggregatorPath = process.env.NEXT_PUBLIC_AGGREGATOR_SERVICE_PATH;
const tasksPath = process.env.NEXT_PUBLIC_TASKS_SERVICE_PATH;

// Конфигурация пагинации
const PAGE_SIZE = 5;

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

    // Состояния для поиска и пагинации
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredMembers, setFilteredMembers] = useState<MemberResponse[]>([]);

    useEffect(() => {
        if (open) {
            loadStatuses();
            loadMembers();
            // Сбрасываем выбор при открытии
            setSelectedStatus(task.taskStatus.itemCode);
            setSelectedAssignee(String(task.assignee.memberId));
            setSearchQuery("");
            setCurrentPage(1);
        }
    }, [open]);

    useEffect(() => {
        // Фильтрация участников по поисковому запросу
        if (members.length > 0) {
            const filtered = members.filter(member =>
                `${member.firstName} ${member.lastName} ${member.email}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            );
            setFilteredMembers(filtered);
            setCurrentPage(1); // Сброс пагинации при изменении поиска
        }
    }, [members, searchQuery]);

    const loadStatuses = async () => {
        const response = await fetch(`${baseUrl}${referencePath}/references/items?referenceType=TASK_STATUS`, {
            headers: { Authorization: `Bearer ${token}` }
        });
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
        const membersData = await response.json();
        setMembers(membersData);
        setFilteredMembers(membersData);
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

    // Функция для получения инициалов пользователя
    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
    };

    // Пагинация
    const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE);
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedMembers = filteredMembers.slice(startIndex, startIndex + PAGE_SIZE);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={'min-w-[70vw] h-[70vh] overflow-auto flex flex-col'}>
                <DialogHeader>
                    <DialogTitle>Change Task Status</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 flex-grow overflow-hidden flex flex-col">
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
                    <div className="flex-grow flex flex-col overflow-hidden">
                        <Label htmlFor="assignee">Assignee</Label>

                        {/* Поиск пользователя */}
                        <div className="mb-3">
                            <Input
                                placeholder="Search assignee by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Таблица пользователей */}
                        <div className="border rounded-lg overflow-hidden flex-grow flex flex-col">
                            <Table className="flex-grow">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="overflow-y-auto">
                                    {paginatedMembers.length > 0 ? (
                                        paginatedMembers.map((member) => (
                                            <TableRow
                                                key={member.memberId.toString()}
                                                className={cn(
                                                    "cursor-pointer hover:bg-gray-50",
                                                    selectedAssignee === member.memberId.toString() && "bg-blue-50"
                                                )}
                                                onClick={() => setSelectedAssignee(member.memberId.toString())}
                                            >
                                                <TableCell>
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={member.avatarUrl || ""} alt={member.firstName} />
                                                        <AvatarFallback>
                                                            {getInitials(member.firstName, member.lastName)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell>
                                                    {member.firstName} {member.lastName}
                                                </TableCell>
                                                <TableCell>{member.email}</TableCell>
                                                <TableCell>
                          <span className={cn(
                              "px-2 py-1 rounded-full text-xs",
                              member.memberStatus.itemCode === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          )}>
                            {member.memberStatus.description}
                          </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                No members found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Пагинация */}
                            <div className="flex justify-between items-center p-3 border-t">
                                <div className="text-sm text-gray-600">
                                    Showing {startIndex + 1} - {Math.min(startIndex + PAGE_SIZE, filteredMembers.length)} of {filteredMembers.length} members
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages || filteredMembers.length === 0}
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Текущий выбор */}
                        {selectedAssignee && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium">Selected Assignee:</p>
                                {(() => {
                                    const member = members.find(m => m.memberId.toString() === selectedAssignee);
                                    return member ? (
                                        <div className="flex items-center mt-1">
                                            <Avatar className="h-6 w-6 mr-2">
                                                <AvatarImage src={member.avatarUrl || ""} alt={member.firstName} />
                                                <AvatarFallback>
                                                    {getInitials(member.firstName, member.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{member.firstName} {member.lastName} ({member.email})</span>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex justify-end space-x-2 pt-4">
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