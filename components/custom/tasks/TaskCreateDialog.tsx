'use client'

import {TaskResponse} from "@/type/TaskResponse";
import * as React from "react";
import {useEffect, useState} from "react";
import {ReferenceItemResponse} from "@/type/ReferenceItemResponse";
import {toast} from "sonner";
import {useWorkspace} from "@/context/WorkspaceProvider";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Loader2, PlusIcon, Tags, User} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {useAuth} from "@/context/AppAuthProvider";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {ProjectResponse} from "@/type/ProjectResponse";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Label} from "@/components/ui/label";
import {TagResponse} from "@/type/TagResponse";
import {MemberResponse} from "@/type/MemberResponse";

const TaskSchema = z.object({
    title: z.string().min(5, "Название должно содержать минимум 5 символов"),
    description: z.string().min(1, "Описание обязательно"),
    taskStatusCode: z.string().min(1, "Выберите статус"),
    taskPriorityCode: z.string().min(1, "Выберите приоритет"),
    taskTypeCode: z.string().min(1, "Выберите тип"),
    projectId: z.coerce.number().min(1, "Выберите проект"),
    workspaceId: z.coerce.number(),
    assigneeId: z.coerce.number().optional(),
    tagIds: z.array(z.coerce.number()).optional()
});

interface TaskCreateDialogComponentProps {
    onCreateTask: (newTask: TaskResponse) => void;
    className?: string | null;
    defaultStatusCode?: string;
    defaultProject?: ProjectResponse
}

const TaskCreateDialogComponent = ({
                                       onCreateTask,
                                       className,
                                       defaultStatusCode,
                                       defaultProject
                                   }: TaskCreateDialogComponentProps) => {
    const {token} = useAuth();
    const {currentWorkspace} = useWorkspace();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [taskStatus, setTaskStatus] = useState<ReferenceItemResponse[]>([]);
    const [taskPriority, setTaskPriority] = useState<ReferenceItemResponse[]>([]);
    const [taskType, setTaskType] = useState<ReferenceItemResponse[]>([]);
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [employees, setEmployees] = useState<MemberResponse[]>([]);
    const [tags, setTags] = useState<TagResponse[]>([]);

    const form = useForm<z.infer<typeof TaskSchema>>({
        resolver: zodResolver(TaskSchema),
        defaultValues: {
            title: "",
            description: "",
            taskStatusCode: defaultStatusCode || "",
            taskPriorityCode: "",
            taskTypeCode: "",
            projectId: defaultProject?.projectId || 0,
            workspaceId: currentWorkspace?.workspaceId || 0,
            tagIds: []
        }
    });

    useEffect(() => {
        if (defaultStatusCode) {
            form.setValue("taskStatusCode", defaultStatusCode);
        }
    }, [defaultStatusCode, form]);

    const loadData = async () => {
        if (!isOpen || !token || !currentWorkspace) return;

        try {
            setLoading(true);
            setError(null);

            const baseUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;
            const referencePath = process.env.NEXT_PUBLIC_REFERENCE_SERVICE_PATH;
            const aggregatorPath = process.env.NEXT_PUBLIC_AGGREGATOR_SERVICE_PATH;

            // Загрузка статусов, приоритетов и типов задач
            const references = await Promise.all([
                fetch(`${baseUrl}${referencePath}/references/items?referenceType=TASK_STATUS`, {
                    headers: {Authorization: `Bearer ${token}`}
                }),
                fetch(`${baseUrl}${referencePath}/references/items?referenceType=TASK_PRIORITY`, {
                    headers: {Authorization: `Bearer ${token}`}
                }),
                fetch(`${baseUrl}${referencePath}/references/items?referenceType=TASK_TYPE`, {
                    headers: {Authorization: `Bearer ${token}`}
                })
            ]);

            // Check if all requests were successful
            const failedRequest = references.find(res => !res.ok);
            if (failedRequest) {
                throw new Error(`Failed to fetch reference data: ${failedRequest.status}`);
            }

            const [statusRes, priorityRes, typeRes] = await Promise.all(
                references.map(res => res.json())
            );

            setTaskStatus(statusRes);
            setTaskPriority(priorityRes);
            setTaskType(typeRes);

            // Загрузка проектов
            if (!defaultProject) {
                const projectsRes = await fetch(
                    `${baseUrl}${aggregatorPath}/projects`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            workspaceId: currentWorkspace.workspaceId.toString()
                        }
                    }
                );
                setProjects(await projectsRes.json());
            }

            // Загрузка сотрудников (предполагая эндпоинт)
            /*const employeesRes = await fetch(
                `${baseUrl}${process.env.NEXT_PUBLIC_WORKSPACE_SERVICE_PATH}/workspaces/${currentWorkspace.workspaceId}/members`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEmployees(await employeesRes.json());*/

        } catch (error) {
            console.error("Failed to load data:", error);
            setError("Не удалось загрузить данные. Попробуйте позже.");
            toast.error("Ошибка загрузки данных");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        if (isOpen) loadData();
    }, [isOpen, token, currentWorkspace]);

    const onSubmit = async (data: z.infer<typeof TaskSchema>) => {
        try {
            const url = `${process.env.NEXT_PUBLIC_GATEWAY_URL}${process.env.NEXT_PUBLIC_TASKS_SERVICE_PATH}/tasks`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'workspaceId': `${currentWorkspace?.workspaceId}`
                },
                body: JSON.stringify({
                    ...data,
                    workspaceId: currentWorkspace?.workspaceId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Ошибка создания задачи");
            }

            const newTask = await response.json() as TaskResponse;
            toast.success("Задача создана", {
                description: `Задача "${data.title}" успешно создана`,
                duration: 5000
            });

            onCreateTask(newTask);
            form.reset();
            setIsOpen(false);
        } catch (error: any) {
            toast.error("Ошибка", {
                description: error.message || "Неизвестная ошибка при создании задачи",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {className ? (
                    <Button variant="outline" className={className}>
                        <PlusIcon size={25}/>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm">
                        <PlusIcon className="mr-2 h-4 w-4"/>
                        <span>Добавить задачу</span>
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className=" min-w-[150vh] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Новая задача</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin"/>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-destructive">
                        <p>{error}</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                                setError(null);
                                loadData();
                            }}
                        >
                            Повторить попытку
                        </Button>
                    </div>
                ) : (
                    <ScrollArea className="flex-1 pr-4">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6 pb-4"
                            >
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Название */}
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Название задачи</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Введите название задачи"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Описание */}
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Подробное описание</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Детальное описание задачи"
                                                        {...field}
                                                        className="min-h-[150px]"
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Основные параметры */}
                                    <div className="space-y-6">
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                            <Label className="mb-4 block font-semibold">Параметры задачи</Label>

                                            <div className="space-y-4">
                                                {/* Статус */}
                                                <FormField
                                                    control={form.control}
                                                    name="taskStatusCode"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Статус {defaultStatusCode && (
                                                                <span className="text-xs text-muted-foreground ml-2">
                    (По умолчанию)
                  </span>
                                                            )}
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                value={field.value}
                                                                disabled={!!defaultStatusCode} // Блокируем выбор, если статус задан
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Выберите статус"/>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {taskStatus.map((item) => (
                                                                        <SelectItem key={item.itemCode}
                                                                                    value={item.itemCode}>
                                                                            {item.description}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Приоритет */}
                                                <FormField
                                                    control={form.control}
                                                    name="taskPriorityCode"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Приоритет</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Выберите приоритет"/>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {taskPriority.map((item) => (
                                                                        <SelectItem key={item.itemCode}
                                                                                    value={item.itemCode}>
                                                                            {item.description}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Тип */}
                                                <FormField
                                                    control={form.control}
                                                    name="taskTypeCode"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Тип задачи</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Выберите тип"/>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {taskType.map((item) => (
                                                                        <SelectItem key={item.itemCode}
                                                                                    value={item.itemCode}>
                                                                            {item.description}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Теги */}
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                            <Label className="mb-4 block font-semibold flex items-center gap-2">
                                                <Tags className="h-4 w-4"/> Теги
                                            </Label>

                                            <FormField
                                                control={form.control}
                                                name="tagIds"
                                                render={({field}) => (
                                                    <FormItem>
                                                        {/*<MultiSelect
                                                            options={tags.map(tag => ({
                                                                value: tag.itemId?.toString() || "",
                                                                label: tag.description
                                                            }))}
                                                            selected={field.value?.map(String) || []}
                                                            onChange={(values) => field.onChange(values.map(Number))}
                                                            placeholder="Выберите теги"
                                                        />*/}
                                                        <FormMessage/>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Контекст задачи */}
                                    <div className="space-y-6">
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                            <Label className="mb-4 block font-semibold">Контекст задачи</Label>

                                            <div className="space-y-4">
                                                {/* Проект */}
                                                {/*<FormField
                                                    control={form.control}
                                                    name="projectId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Проект</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                value={field.value?.toString()}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Выберите проект" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {projects.map((project) => (
                                                                        <SelectItem
                                                                            key={project.projectId}
                                                                            value={project.projectId.toString()}
                                                                        >
                                                                            {project.projectName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />*/}

                                                <FormField
                                                    control={form.control}
                                                    name="projectId"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Проект {defaultProject && (
                                                                <span className="text-xs text-muted-foreground ml-2">
                    {defaultProject.projectName}(По умолчанию)
                  </span>
                                                            )}
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                value={field.value.toString()}
                                                                disabled={!!defaultProject} // Блокируем выбор, если статус задан
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Выберите проект"/>
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {projects.map((project) => (
                                                                        <SelectItem
                                                                            key={project.projectId}
                                                                            value={project.projectId.toString()}
                                                                        >
                                                                            {project.projectName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Исполнитель */}
                                                <FormField
                                                    control={form.control}
                                                    name="assigneeId"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <User className="h-4 w-4"/> Исполнитель
                                                            </FormLabel>
                                                            {/*<Select
                                                                onValueChange={field.onChange}
                                                                value={field.value?.toString()}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Назначьте исполнителя" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="">Не назначено</SelectItem>
                                                                    {employees.length > 0 && employees.map((employee) => (
                                                                        <SelectItem
                                                                            key={employee.memberId}
                                                                            value={employee.memberId.toString()}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <span>{employee.firstName} {employee.lastName}</span>
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    position
                                        </span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>*/}
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Даты (опционально) */}
                                        {/* <div className="bg-muted/50 p-4 rounded-lg">
                      <Label className="mb-4 block font-semibold">Сроки выполнения</Label>

                      <div className="grid grid-cols-2 gap-4">
                        <FormItem>
                          <FormLabel>Дата начала</FormLabel>
                          <Input type="date" />
                        </FormItem>

                        <FormItem>
                          <FormLabel>Срок выполнения</FormLabel>
                          <Input type="date" />
                        </FormItem>
                      </div>
                    </div> */}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-4 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Отмена
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.formState.isSubmitting}
                                    >
                                        {form.formState.isSubmitting && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        )}
                                        Создать задачу
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </ScrollArea>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default TaskCreateDialogComponent;