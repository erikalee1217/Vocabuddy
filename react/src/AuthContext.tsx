import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios'; // Import Axios

import { AuthContextType } from './Types'

axios.defaults.baseURL = 'http://35.208.70.236/';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<any>(null);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.get('/api/User/auth', { params: { Email: email, Password: password }});
            console.log(response.data[0])
            if (response.data[0]) {
                setUser(response.data);
                setIsLoggedIn(true);
                sessionStorage.setItem('user', JSON.stringify(response.data));
            }
        } catch (error) {
            console.error("Login failed:", error);
            // Handle errors (e.g., incorrect credentials, no network access)
        }
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUser(null);
        sessionStorage.removeItem('user');
    };

    useEffect(() => {
        const savedUser = sessionStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
