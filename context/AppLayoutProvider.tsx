'use client'

import SideBarComponent from "@/components/custom/layout/side-bar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import NavBarComponent from "@/components/custom/layout/nav-bar";
import {usePathname, useRouter} from "next/navigation";
import {AuthProvider, useAuth} from "@/context/AppAuthProvider";

export default function AppLayoutProvider({
                                              children,
                                          }: Readonly<{
                                              children: React.ReactNode;
                                          }>
) {

    const pathname = usePathname()

    return (
        <body className='flex flex-row'>
        <AuthProvider>
            {pathname.startsWith('/signin') || pathname.startsWith('/signup') ? (
                children
            ) : (
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "17rem",
                        } as React.CSSProperties
                    }
                >
                    <SideBarComponent/>
                    <SidebarInset>
                        <header className="flex h-16 shrink-0 justify-between items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 w-full"> {/* Добавлено w-full */}
                            <div className="flex flex-row items-center gap-2 px-4">
                                <SidebarTrigger className="-ml-1"/>
                                <Separator
                                    orientation="vertical"
                                    className="mr-2 data-[orientation=vertical]:h-4"
                                />
                                <NavBarComponent/> {/* Этот компонент теперь займет оставшееся пространство */}
                            </div>
                        </header>
                        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
                            {children}
                        </main>
                    </SidebarInset>
                </SidebarProvider>
            )}
        </AuthProvider>
        </body>
    )
}