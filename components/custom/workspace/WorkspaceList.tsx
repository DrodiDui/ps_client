'use client'

import {PageableWorkspaceResponse, WorkspaceResponse} from "@/type/WorkspaceResponse"
import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {useWorkspace} from "@/context/WorkspaceProvider";
import {useRouter} from "next/navigation";
import WorkspaceDialogComponent from "@/components/custom/workspace/workspace-dialog";
import {useAuth} from "@/context/AppAuthProvider";
import {Switch} from "@/components/ui/switch";
import {Skeleton} from "@/components/ui/skeleton"; // Добавлен компонент скелетона
import {toast} from "sonner"; // Для уведомлений

const WorkspaceListComponent = () => {
    const {token} = useAuth();
    const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
    const [onlyOwner, setOnlyOwned] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Состояние загрузки
    const [error, setError] = useState<string | null>(null); // Состояние ошибки

    const {currentWorkspace, setCurrentWorkspace} = useWorkspace();
    const router = useRouter();

    const getWorkspacesUrl = (onlyOwned: boolean) => {
        return `${process.env.NEXT_PUBLIC_GATEWAY_URL}${process.env.NEXT_PUBLIC_AGGREGATOR_SERVICE_PATH}/workspaces?onlyOwned=${onlyOwned}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(getWorkspacesUrl(onlyOwner), {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json() as PageableWorkspaceResponse;
                setWorkspaces(data.workspaces);
            } catch (err) {
                console.error("Failed to fetch workspaces:", err);
                setError("Failed to load workspaces. Please try again later.");
                toast.error("Error loading workspaces");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [onlyOwner, token]);

    const handleWorkspaceClick = (workspace: WorkspaceResponse) => {
        setCurrentWorkspace(workspace);
        router.push('/projects');
    };

    const handleToggleOnlyOwned = () => {
        setOnlyOwned(prev => {
            const newValue = !prev;
            return newValue;
        });
    };

    const handleWorkspaceCreated = (newWorkspace: WorkspaceResponse) => {
        setWorkspaces(prev => [newWorkspace, ...prev]);
        toast.success("Workspace created successfully!");
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className='flex justify-between'>
                    <Skeleton className="h-8 w-48"/>
                    <div className="flex gap-2 items-center">
                        <Skeleton className="h-6 w-12 rounded-full"/>
                        <Skeleton className="h-5 w-48"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4"/>
                                <Skeleton className="h-4 w-full mt-2"/>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full"/>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
                <div className="text-destructive">{error}</div>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    return (
        <div>
            <div className='flex justify-between items-center mb-6'>
               <div className={'flex gap-3'}>
                   <h1 className="text-2xl font-bold">
                       Choose workspace
                   </h1>
                   <WorkspaceDialogComponent onWorkspaceCreated={handleWorkspaceCreated}/>
               </div>
                <div className="flex gap-2 items-center">
                    <Switch
                        id="only-owned"
                        checked={onlyOwner}
                        onCheckedChange={handleToggleOnlyOwned}
                    />
                    <label htmlFor="only-owned" className="cursor-pointer">
                        Only owned workspaces
                    </label>
                </div>
            </div>

            {workspaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {workspaces.map((item) => (
                        <Card
                            key={item.workspaceId}
                            className={cn(
                                "hover:shadow-md transition-shadow h-full flex flex-col",
                                currentWorkspace?.workspaceId === item.workspaceId && "border-primary ring-2 ring-primary/10"
                            )}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between">
                                    <CardTitle className="truncate">{item.workspaceName}</CardTitle>
                                    <Avatar>
                                        <AvatarImage
                                            src={`https://avatar.vercel.sh/${item.workspaceId}`}
                                            alt={item.workspaceName}
                                        />
                                        <AvatarFallback>
                                            {item.workspaceName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                <CardDescription>{item.description || ' No description'}</CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleWorkspaceClick(item)}
                                >
                                    {currentWorkspace?.workspaceId === item.workspaceId ? ' Active' : ' Select'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center gap-4 py-10">
                    <div className="text-center">
                        <p className="text-lg mb-2">You don' t have any workspaces yet
                        </p>
                        <p className="text-muted-foreground">Create your first workspace to get started</p>
                    </div>
                    <WorkspaceDialogComponent onWorkspaceCreated={handleWorkspaceCreated}/>
                </div>
            )
            }
        </div>
    )
}

export default WorkspaceListComponent;
