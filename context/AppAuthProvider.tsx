import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type AuthContextType = {
    token: string | null;
    login: (token: string, userId: number) => void;
    logout: () => void;
    userId: number | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null)

    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) setToken(storedToken);

        const soreUserId = localStorage.getItem('userId');
        if (soreUserId) setUserId(Number(soreUserId))
    }, []);

    const login = (token: string, userId: number) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', userId.toString());
        setToken(token);
        setUserId(userId)
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId')
        setToken(null);
        setUserId(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, userId }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}