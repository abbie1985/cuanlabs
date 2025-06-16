
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, AuthContextType, ChildrenProps } from '../types';
import { MOCK_API_DELAY } from '../constants';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<ChildrenProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState<boolean>(true); // For initial auth check

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    if (storedUser && storedToken) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'user@example.com') { // Dummy check
          const mockUser: User = {
            id: '1',
            name: 'John Doe',
            email: 'user@example.com',
            membershipTier: 'premium',
            referralCode: 'CUANXYZ123',
            commission: 150000
          };
          const mockToken = 'fake-jwt-token';
          localStorage.setItem('currentUser', JSON.stringify(mockUser));
          localStorage.setItem('authToken', mockToken);
          setCurrentUser(mockUser);
          setToken(mockToken);
          setLoading(false);
          resolve(true);
        } else {
          setLoading(false);
          resolve(false);
        }
      }, MOCK_API_DELAY);
    });
  };

  const register = async (name: string, email: string, _pass: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: Date.now().toString(),
          name: name,
          email: email,
          membershipTier: 'free',
          referralCode: `CUAN${Date.now().toString().slice(-5)}`,
          commission: 0
        };
        const mockToken = 'fake-jwt-token-new-user';
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        localStorage.setItem('authToken', mockToken);
        setCurrentUser(mockUser);
        setToken(mockToken);
        setLoading(false);
        resolve(true);
      }, MOCK_API_DELAY);
    });
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!token, token, login, logout, register, loading }}>
      {!loading && children}
      {loading && <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div><p className="ml-3 text-white">Loading...</p></div>}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
