'use client'

import { ChevronLeft } from 'lucide-react'; // Используем стандартную иконку
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceProvider';
import { useAuth } from '@/context/AppAuthProvider';

const NavBarComponent = () => {
    const { currentWorkspace } = useWorkspace();
    const { logout } = useAuth(); // Получаем функцию logout из контекста
    const router = useRouter();
    const pathname = usePathname();

    const noBackButtonPaths = new Set(['/', '/signin', '/signup']);
    const showBackButton = currentWorkspace && !noBackButtonPaths.has(pathname);

    const handleBack = () => {
        if (window.history.state?.idx > 0) {
            router.back();
        } else {
            router.push('/');
        }
    };

    const handleLogout = () => {
        logout()
        router.push('/signin')
    }

    return (
        <div className="flex justify-between items-center w-full"> {/* Главный контейнер */}
            <div className="flex-1">
                {showBackButton && (
                    <Button
                        onClick={handleBack}
                        variant="ghost"
                        className="flex gap-2 items-center"
                        aria-label="Вернуться в рабочее пространство"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="truncate max-w-[160px]">
              {currentWorkspace.workspaceName}
            </span>
                    </Button>
                )}
            </div>

            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="ml-auto"
                    aria-label="Выйти из системы"
                >
                    Выйти
                </Button>
            </div>
        </div>
    );
};

export default NavBarComponent;