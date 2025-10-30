import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const loggedInUser = await authService.login({ email, pass });
      localStorage.removeItem('user'); // Clear old edits on a fresh login
      setUser(loggedInUser);
      sessionStorage.setItem('user', JSON.stringify(loggedInUser));
      return true;
    } catch (error) {
      console.error("API login failed, using fallback. Error:", error);
     
      return false;
    }
  };

  const logout = () => {
    try {
      authService.logout(); // Fire and forget API call
    } catch(error) {
      console.error("API logout call failed. Proceeding with client-side logout.", error);
    }
    setUser(null);
    sessionStorage.removeItem('user');
    localStorage.removeItem('user');
    navigate('/');
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
