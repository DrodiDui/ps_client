'use client'

import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {z} from "zod";
import {useState} from "react";
import {useAuth} from "@/context/AppAuthProvider";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import {WorkspaceResponse} from "@/type/WorkspaceResponse"; // Добавлен toast для уведомлений

interface WorkspaceDialogComponentProps {
    onWorkspaceCreated: (newWorkspace: WorkspaceResponse) => void;
}

const WorkspaceSchema = z.object({
    workspaceName: z.string().min(1, 'Workspace name is required'),
    description: z.string().min(1, 'Description is required')
});

const WorkspaceDialogComponent = ({onWorkspaceCreated}: WorkspaceDialogComponentProps) => {
    const {token} = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof WorkspaceSchema>>({
        resolver: zodResolver(WorkspaceSchema),
        defaultValues: {
            workspaceName: '',
            description: ''
        }
    });

    const createWorkspace = async (data: z.infer<typeof WorkspaceSchema>) => {
        setIsLoading(true);
        try {
            // Исправленные переменные окружения
            const url = `${process.env.NEXT_PUBLIC_GATEWAY_URL}${process.env.NEXT_PUBLIC_WORKSPACE_SERVICE_PATH}/workspaces`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newWorkspace = await response.json() as WorkspaceResponse;
            onWorkspaceCreated(newWorkspace);
            setIsOpen(false);
            form.reset();
            toast.success('Workspace created successfully!');
        } catch (error) {
            console.error('Error creating workspace:', error);
            toast.error('Failed to create workspace');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Add new workspace</Button>
            </DialogTrigger>

            <DialogContent>
                <h2 className="text-xl font-semibold mb-4">Create New Workspace</h2>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(createWorkspace)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="workspaceName"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Workspace Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter workspace name"
                                            {...field}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe your workspace"
                                            {...field}
                                            disabled={isLoading}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating..." : "Create Workspace"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default WorkspaceDialogComponent;