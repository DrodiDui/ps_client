'use client'

import {Card} from "@/components/ui/card";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import TaskTable from "@/components/custom/tasks/TaskTable";
import {useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {useAuth} from "@/context/AppAuthProvider";
import {useWorkspace} from "@/context/WorkspaceProvider";
import {ProjectResponse} from "@/type/ProjectResponse";
import TaskCalendar from "@/components/custom/tasks/TaskCalendar";
import TaskStatusCardComponent from "@/components/custom/tasks/TaskStatusCard";

const taskWorkflowType = [
    {
        workflowId: 1,
        code: 'table',
        workflowName: 'Table',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"></path>
                <path d="M3 9h18M3 15h18M9 3v18M15 3v18"></path>
            </svg>
        )
    },
    {
        workflowId: 2,
        code: 'card',
        workflowName: 'Board',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <path d="M3 9h18M3 15h18M9 3v18M15 3v18"></path>
            </svg>
        )
    },
    {
        workflowId: 3,
        code: 'calendar',
        workflowName: 'Calendar',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
        )
    }
];

const TaskTabsComponent = () => {
    const [activeTab, setActiveTab] = useState('table');
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
    const { token } = useAuth();
    const { currentWorkspace } = useWorkspace();
    const baseUrl = `${process.env.NEXT_PUBLIC_GATEWAY_URL}`;



    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full sm:w-auto"
                >
                    <TabsList className="bg-gradient-to-r from-indigo-50 to-purple-50 p-1 h-auto">
                        {taskWorkflowType.map((item) => (
                            <TabsTrigger
                                key={`workflow-${item.workflowId}`}
                                value={`${item.code}`}
                                className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center"
                            >
                                {item.icon}
                                {item.workflowName}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2"
                >
                    {activeTab === 'table' && (
                        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                            <TaskTable/>
                        </Card>
                    )}

                    {activeTab === 'card' && (
                        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                            <TaskStatusCardComponent/>
                        </Card>
                    )}

                    {activeTab === 'calendar' && (
                        <Card className="border border-gray-200 shadow-sm rounded-xl overflow-hidden">
                            <TaskCalendar />
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// Иконка фильтра
const FilterIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 21V14"></path>
        <path d="M4 10V3"></path>
        <path d="M12 21V12"></path>
        <path d="M12 8V3"></path>
        <path d="M20 21V16"></path>
        <path d="M20 12V3"></path>
        <path d="M1 14h6"></path>
        <path d="M9 8h6"></path>
        <path d="M17 16h6"></path>
    </svg>
);

// Компоненты для Dropdown (упрощенные)
const DropdownMenu = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">{children}</div>
);

const DropdownMenuTrigger = ({ children, asChild }: {
    children: React.ReactNode,
    asChild?: boolean
}) => (
    <div>{children}</div>
);

const DropdownMenuContent = ({
                                 children,
                                 align,
                                 className
                             }: {
    children: React.ReactNode,
    align?: string,
    className?: string
}) => (
    <div className={`absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${className}`}>
        {children}
    </div>
);

const DropdownMenuCheckboxItem = ({
                                      children,
                                      checked,
                                      onCheckedChange
                                  }: {
    children: React.ReactNode,
    checked: boolean,
    onCheckedChange: (checked: boolean) => void
}) => (
    <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
        <input
            type="checkbox"
            className="mr-2 h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
        />
        {children}
    </label>
);

export default TaskTabsComponent;