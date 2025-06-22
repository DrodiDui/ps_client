'use client'

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectResponse } from "@/type/ProjectResponse";
import { useAuth } from "@/context/AppAuthProvider";
import { ReferenceItemResponse } from "@/type/ReferenceItemResponse";
import {useWorkspace} from "@/context/WorkspaceProvider";
import IconRenderer from "@/components/custom/layout/IconRenderer";

// Схема валидации
const ProjectSchema = z.object({
    projectName: z.string().min(5, "Название должно быть не менее 5 символов"),
    description: z.string().min(1, "Описание обязательно"),
    projectTypeCode: z.string().min(1, "Тип проекта обязателен"),
    workspaceId: z.number()

});

interface ProjectAppDialogProps {
    onProjectCreated: (newProject: ProjectResponse) => void;
}

const ProjectAppDialog = ({ onProjectCreated }: ProjectAppDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [projectTypes, setProjectTypes] = useState<ReferenceItemResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth();

    const { currentWorkspace } = useWorkspace()

    const form = useForm<z.infer<typeof ProjectSchema>>({
        resolver: zodResolver(ProjectSchema),
        defaultValues: {
            projectName: "",
            description: "",
            projectTypeCode: "",
            workspaceId: currentWorkspace?.workspaceId
        }
    });

    useEffect(() => {
        if (isOpen) {
            fetchProjectTypes();
        }
    }, [isOpen]);

    const fetchProjectTypes = async () => {
        setIsLoading(true);
        try {
            const url = `${process.env.NEXT_PUBLIC_GATEWAY_URL}${process.env.NEXT_PUBLIC_REFERENCE_SERVICE_PATH}/references/items`;
            const response = await fetch(`${url}?referenceType=PROJECT_TYPE`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки типов проектов: ${response.status}`);
            }

            const data: ReferenceItemResponse[] = await response.json();
            setProjectTypes(data);

        } catch (error) {

        } finally {
            setIsLoading(false);
        }
    };

    // Функция для извлечения метаданных иконки
    const getIconMetadata = (item: ReferenceItemResponse) => {
        if (!item.metadata || item.metadata.length === 0) return null;

        // Ищем метаданные для текущего workspace или глобальные
        const workspaceMeta = item.metadata.find(m => m.workspaceId === currentWorkspace?.workspaceId);
        const globalMeta = item.metadata.find(m => m.workspaceId === null);

        return workspaceMeta?.metadata || globalMeta?.metadata || null;
    };

    const onSubmit = async (data: z.infer<typeof ProjectSchema>) => {
        try {
            const url = `${process.env.NEXT_PUBLIC_GATEWAY_URL}${process.env.NEXT_PUBLIC_WORKSPACE_SERVICE_PATH}/projects`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                /*body: JSON.stringify(data)*/
                body: JSON.stringify({
                    projectName: data.projectName,
                    description: data.description,
                    projectTypeCode: data.projectTypeCode,
                    workspaceId: data.workspaceId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Ошибка ${response.status}`);
            }

            const newProject: ProjectResponse = await response.json();
            toast.success("Проект создан", {
                description: `Проект "${data.projectName}" успешно создан`
            });

            form.reset();
            setIsOpen(false);
            onProjectCreated(newProject);
        } catch (error) {

        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                    <Plus className="size-4" />
                    Создать проект
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogTitle className="mb-4">Создание нового проекта</DialogTitle>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Тип проекта */}
                        <FormField
                            control={form.control}
                            name="projectTypeCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Тип проекта</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isLoading}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Выберите тип проекта" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {projectTypes.map((type) => {
                                                const iconData = getIconMetadata(type);
                                                return (
                                                    <SelectItem
                                                        key={`project-type-${type.referenceItemId}`}
                                                        value={type.itemCode}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {iconData && (
                                                                <IconRenderer
                                                                    iconName={iconData.icon}
                                                                    color={iconData.color}
                                                                    size={16}
                                                                />
                                                            )}
                                                            <span>{type.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Название проекта */}
                        <FormField
                            control={form.control}
                            name="projectName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Название проекта</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Введите название проекта"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Описание проекта */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Описание</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Краткое описание проекта"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Кнопки формы */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "Создание..." : "Создать проект"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default ProjectAppDialog;