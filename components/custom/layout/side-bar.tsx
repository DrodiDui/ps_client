'use client'

import {Button} from "@/components/ui/button";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";
import {Sidebar, SidebarContent, SidebarHeader, SidebarRail, useSidebar} from "@/components/ui/sidebar";
import {cn} from "@/lib/utils";
import {
    ArrowDown, Container,
    Folder,
    LayoutGrid,
    ListChecks,
    ListTodo,
    PanelsTopLeft,
    Server,
    Settings,
    UserCog,
    UsersRound
} from "lucide-react";
import Link from "next/link";
import {useState} from "react";

interface SideBarComponentProps {
    props?: React.ComponentProps<typeof Sidebar>
}

const menuItems = [
    {
        id: 1,
        title: "Projects",
        url: '/projects',
        icon: PanelsTopLeft,
        subItem: []
    },
    {
        id: 2,
        title: "Tasks",
        url: '/tasks',
        icon: ListTodo,
        subItem: []
    },
    {
        id: 3,
        title: "Members",
        url: '/members',
        icon: UsersRound,
        subItem: []
    },
    {
        id: 4,
        title: 'Settings',
        url: '/settings',
        icon: Settings,
        subItems: [
            {
                id: 1,
                title: 'Workspace Settings',
                url: '/settings/workspace',
                icon: Folder
            },
            {
                id: 2,
                title: 'Project Settings',
                url: '/settings/project',
                icon: LayoutGrid
            },
            {
                id: 3,
                title: 'Task Settings',
                url: '/settings/task',
                icon: ListChecks
            },
            {
                id: 4,
                title: 'User Permissions',
                url: '/settings/permissions',
                icon: UserCog
            },
            {
                id: 5,
                title: 'System Config',
                url: '/settings/system',
                icon: Server
            }
        ]
    },
    {
        id: 5,
        title: "Documentations",
        url: '/documentations',
        icon: UsersRound,
        subItem: []
    },
    {
        id: 6,
        title: "Repositories",
        url: '#',
        icon: UsersRound,
        subItem: [
            {
                id: 1,
                title: 'Git Repository',
                url: '/repositories/git',
                icon: Folder
            },
            {
                id: 1,
                title: 'Docker images',
                url: '/repositories/docker',
                icon: Container
            },
        ]
    },
    {
        id: 7,
        title: "Environments",
        url: '/envs',
        icon: Server,
        subItem: [
            {
                id: 1,
                title: 'Git Repository',
                url: '/repositories/git',
                icon: Folder
            },
            {
                id: 1,
                title: 'Docker images',
                url: '/repositories/docker',
                icon: Container
            },
        ]
    }
]

const SideBarComponent = ({props}: SideBarComponentProps) => {

    const {open} = useSidebar()
    const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({});

    const toggleItem = (id: number) => {
        setOpenItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <Sidebar variant="floating" collapsible="icon" {...props}>
            <SidebarHeader className={'flex items-center'}>
                {open ? (
                    <Link href={'/'} className={'flex flex-row'}>
                        <h1 className={'text-3xl text-green-500'}>Project</h1>
                        <span className={'text-2xl'}>Studio</span>
                    </Link>
                ) : (
                    <Link href={'/'} className={'flex'} /*onClick={() => WorkspaceDialogComponent()}*/>
                        <h1 className={'text-3xl text-green-500'}>P</h1>
                        <span className={'text-2xl'}>S</span>
                    </Link>
                )}
            </SidebarHeader>
            <SidebarContent className='flex'>
                {menuItems.map((item) => (
                    <Link href={item.url} key={item.id}
                          className={`flex flex-col ${open ? 'p-2 justify-start gap-2' : 'justify-center'}`}>
                        <div className={'flex gap-3 justify-between'}>
                            <div className={'flex gap-3 justify-between'}>
                                <item.icon/>
                                {open && item.title}
                            </div>
                        </div>
                    </Link>
                ))}
            </SidebarContent>
            <SidebarRail/>
        </Sidebar>
    )
}

export default SideBarComponent