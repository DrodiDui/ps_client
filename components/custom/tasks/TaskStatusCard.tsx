'use client'

import {useCallback, useEffect, useMemo, useState} from "react";
import {
    closestCorners,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useDraggable,
    useDroppable,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {CSS} from '@dnd-kit/utilities';
import {ReferenceItemResponse} from "@/type/ReferenceItemResponse";
import {useAuth} from "@/context/AppAuthProvider";
import {useWorkspace} from "@/context/WorkspaceProvider";
import {TaskResponse, TaskStatusResponse} from "@/type/TaskResponse";
import {Skeleton} from "@/components/ui/skeleton";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {GripVertical, Move, Plus} from "lucide-react";
import {cn} from "@/lib/utils";
import TaskCreateDialog from "@/components/custom/tasks/TaskCreateDialog";

// Компонент для драга задачи
const DraggableTaskCard = ({ task, statusColor }: {
    task: TaskResponse;
    statusColor: string;
}) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `task-${task.taskId}`,
        data: {
            type: 'task',
            task,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 100 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-xl border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-sm cursor-grab active:cursor-grabbing"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-start w-full">
                    <button
                        {...listeners}
                        {...attributes}
                        className="mr-2 p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1 truncate">{task.taskTitle}</h3>

                        <div className="flex space-x-1 mt-1">
                            {task.tags?.slice(0, 2).map(tag => (
                                <span
                                    key={`tag-${tag.tagId}`}
                                    className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded truncate max-w-[80px]"
                                >
                  {tag.tagName}
                </span>
                            ))}
                            {task.tags?.length > 2 && (
                                <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                  +{task.tags.length - 2}
                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-3">
                <div className="flex items-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-6 h-6" />
                    <div className="ml-2 text-xs text-gray-500 truncate max-w-[80px]">
                        {(task.assignee?.firstName && task.assignee?.lastName) || 'Unassigned'}
                    </div>
                </div>

                <div className="flex space-x-2">
          <span className={cn(
              "text-xs px-2 py-1 rounded",
              statusColor
          )}>
            {task.taskStatus?.description || 'No status'}
          </span>
                </div>
            </div>
        </div>
    );
};

// Компонент для дроп-зоны (колонки статуса)
const DroppableStatusColumn = ({
                                   status,
                                   tasks,
                                   colorClass,
                                   onTaskCreate // Добавляем пропс для обработки создания задачи
                               }: {
    status: ReferenceItemResponse;
    tasks: TaskResponse[];
    colorClass: string;
    onTaskCreate: (newTask: TaskResponse) => void;
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `status-${status.referenceItemId}`,
        data: {
            type: 'status',
            status,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-shrink-0 w-72 mr-6 last:mr-0 transition-colors",
                isOver ? "bg-blue-50 rounded-lg" : ""
            )}
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                    <div className={cn(
                        "w-3 h-3 rounded-full mr-2",
                        colorClass.split(' ')[0]
                    )} />
                    <h2 className="font-semibold text-gray-800 truncate max-w-[120px]">{status.description}</h2>
                    <span className="ml-2 bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 text-xs">
            {tasks.length}
          </span>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <TaskCreateDialog
                                className={'flex size-4 rounded-full'}
                                onCreateTask={onTaskCreate}
                                defaultStatusCode={status.itemCode}
                            />
                        </TooltipTrigger>
                        <TooltipContent>

                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className={cn(
                "space-y-3 min-h-[200px] transition-all",
                isOver ? "bg-blue-50 rounded-lg p-2" : ""
            )}>
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <DraggableTaskCard
                            key={`task-${task.taskId}`}
                            task={task}
                            statusColor={colorClass}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-400 text-sm">Drop task here</p>
                        <TaskCreateDialog
                            onCreateTask={onTaskCreate}
                            defaultStatusCode={status.itemCode}
                            className="mt-3"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Основной компонент
const TaskStatusCardComponent = () => {
    const { token } = useAuth();
    const { currentWorkspace } = useWorkspace();

    const baseUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
    const referencePath = process.env.NEXT_PUBLIC_REFERENCE_SERVICE_PATH;
    const aggregatorTasksPath = process.env.NEXT_PUBLIC_AGGREGATOR_SERVICE_PATH;
    const tasksPath = process.env.NEXT_PUBLIC_TASKS_SERVICE_PATH

    const [statuses, setStatuses] = useState<ReferenceItemResponse[]>([]);
    const [statusTasks, setStatusTasks] = useState<TaskStatusResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTask, setActiveTask] = useState<TaskResponse | null>(null);

    // Цвета для разных статусов
    const statusColors: Record<string, string> = {
        TODO: "bg-blue-100 text-blue-800 border-blue-200",
        IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-200",
        REVIEW: "bg-purple-100 text-purple-800 border-purple-200",
        DONE: "bg-green-100 text-green-800 border-green-200",
        BLOCKED: "bg-red-100 text-red-800 border-red-200",
    };

    // Сенсоры для DnD
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 10,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    // Группировка задач по статусам
    const tasksByStatus = useMemo(() => {
        const map: Record<string, TaskResponse[]> = {};
        statusTasks.forEach(group => {
            map[group.status.itemCode] = group.tasks;
        });
        return map;
    }, [statusTasks]);

    useEffect(() => {
        const abortController = new AbortController();

        const loadData = async () => {
            if (!token || !currentWorkspace) return;

            try {
                setLoading(true);
                setError(null);

                const [statusesRes, tasksRes] = await Promise.all([
                    fetch(`${baseUrl}${referencePath}/references/items?referenceType=TASK_STATUS`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'workspaceId': `${currentWorkspace.workspaceId}`
                        },
                        signal: abortController.signal
                    }),
                    fetch(`${baseUrl}${aggregatorTasksPath}/tasks/statusGroup`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'workspaceId': `${currentWorkspace.workspaceId}`
                        },
                        signal: abortController.signal
                    })
                ]);

                if (!statusesRes.ok) throw new Error('Failed to load statuses');
                if (!tasksRes.ok) throw new Error('Failed to load tasks');

                setStatuses(await statusesRes.json());
                setStatusTasks(await tasksRes.json());
            } catch (err) {
                if (!abortController.signal.aborted) {
                    setError(err instanceof Error ? err.message : 'Unknown error');
                    console.error('Loading failed:', err);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => abortController.abort();
    }, [token, currentWorkspace, baseUrl, referencePath, aggregatorTasksPath]);

    // Обработка начала перетаскивания
    const handleDragStart = useCallback((event: DragStartEvent) => {
        if (event.active.data.current?.type === 'task') {
            setActiveTask(event.active.data.current.task);
        }
    }, []);

    // Обработка завершения перетаскивания
    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveTask(null);
            return;
        }

        // Проверяем, что перетащили задачу (active) над колонкой (over)
        if (active.data.current?.type === 'task' && over.data.current?.type === 'status') {
            const task = active.data.current.task as TaskResponse;
            const newStatus = over.data.current.status as ReferenceItemResponse;

            // Если статус не изменился, ничего не делаем
            if (task.taskStatus?.itemCode === newStatus.itemCode) {
                setActiveTask(null);
                return;
            }

            // Оптимистичное обновление: перемещаем задачу в новую колонку
            const updatedStatusTasks = [...statusTasks];
            let found = false;

            // Удаляем задачу из старого статуса
            updatedStatusTasks.forEach(group => {
                if (group.status.itemCode === task.taskStatus?.itemCode) {
                    group.tasks = group.tasks.filter(t => t.taskId !== task.taskId);
                    found = true;
                }
            });

            // Добавляем задачу в новый статус
            updatedStatusTasks.forEach(group => {
                if (group.status.itemCode === newStatus.itemCode) {
                    group.tasks.push({ ...task, taskStatus: newStatus });
                }
            });

            // Если не нашли старую группу (например, если статус был пуст), создаем новую
            if (!found) {
                updatedStatusTasks.push({
                    status: task.taskStatus || { referenceItemId: 0, referenceType: '', itemCode: '', description: '', metadata: [] },
                    tasks: [task]
                });
            }

            setStatusTasks(updatedStatusTasks);
            setActiveTask(null);

            // Отправляем запрос на обновление статуса задачи
            try {
                const response = await fetch(`${baseUrl}${tasksPath}/tasks/${task.taskId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'workspaceId': `${currentWorkspace?.workspaceId}`
                    },
                    body: JSON.stringify({
                        statusCode: newStatus.itemCode
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to update task status');
                }
            } catch (err) {
                console.error('Error updating task status:', err);
                // Откатываем оптимистичное обновление
                setStatusTasks(statusTasks);
            }
        }
    }, [statusTasks, token, currentWorkspace, baseUrl, aggregatorTasksPath]);

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-medium text-lg text-red-800">Loading Error</h3>
                        <p className="text-red-600">{error} - Please try again later</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4">
                {[...Array(4)].map((_, i) => (
                    <div key={`skeleton-${i}`} className="flex-shrink-0 w-72 mr-4">
                        <div className="mb-4 flex items-center justify-between">
                            <Skeleton className="h-6 w-32 rounded" />
                            <Skeleton className="h-5 w-5 rounded-full" />
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                            <Skeleton className="h-24 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const handleTaskCreate = useCallback((newTask: TaskResponse) => {
        setStatusTasks(prev => {
            const updated = [...prev];
            const statusGroup = updated.find(g => g.status.itemCode === newTask.taskStatus?.itemCode);

            if (statusGroup) {
                statusGroup.tasks.push(newTask);
            } else {
                updated.push({
                    status: newTask.taskStatus!,
                    tasks: [newTask]
                });
            }

            return updated;
        });
    }, []);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 custom-scrollbar">
                {statuses.map((status) => (
                    <DroppableStatusColumn
                        key={`status-${status.referenceItemId}`}
                        status={status}
                        tasks={tasksByStatus[status.itemCode] || []}
                        colorClass={statusColors[status.itemCode] || "bg-gray-100 text-gray-800 border-gray-200"}
                        onTaskCreate={handleTaskCreate}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? (
                    <div className="bg-white rounded-xl border-2 border-blue-400 p-4 shadow-lg w-72">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start w-full">
                                <button className="mr-2 p-1 text-gray-400 cursor-grabbing">
                                    <GripVertical className="h-4 w-4" />
                                </button>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 mb-1 truncate">{activeTask.taskTitle}</h3>

                                    <div className="flex space-x-1 mt-1">
                                        {activeTask.tags?.slice(0, 2).map(tag => (
                                            <span
                                                key={`tag-${tag.tagId}`}
                                                className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded truncate max-w-[80px]"
                                            >
                        {tag.tagName}
                      </span>
                                        ))}
                                        {activeTask.tags?.length > 2 && (
                                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        +{activeTask.tags.length - 2}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center">
                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-6 h-6" />
                                <div className="ml-2 text-xs text-gray-500 truncate max-w-[80px]">
                                    {activeTask.assignee?.firstName && activeTask.assignee?.lastName || 'Unassigned'}
                                </div>
                            </div>

                            <div className="flex space-x-2">
                <span className={cn(
                    "text-xs px-2 py-1 rounded",
                    activeTask.taskStatus?.itemCode ? statusColors[activeTask.taskStatus.itemCode] : "bg-gray-100 text-gray-800"
                )}>
                  {activeTask.taskStatus?.description || 'No status'}
                </span>
                            </div>
                        </div>

                        <div className="mt-2 text-xs text-blue-500 flex items-center">
                            <Move className="h-3 w-3 mr-1" />
                            Moving to another status...
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default TaskStatusCardComponent;