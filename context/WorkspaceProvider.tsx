'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {WorkspaceResponse} from "@/type/WorkspaceResponse";


interface WorkspaceContextType {
    currentWorkspace: WorkspaceResponse | null;
    setCurrentWorkspace: (workspace: WorkspaceResponse | null) => void;
    isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
    const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentWorkspace) {
            localStorage.setItem('currentWorkspace', JSON.stringify(currentWorkspace));
        }
    }, [currentWorkspace]);



    return (
        <WorkspaceContext.Provider value={{
            currentWorkspace,
            setCurrentWorkspace,
            isLoading,
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};