'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  name: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  createUser: (name: string) => Promise<User>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize database on first load
    const initializeApp = async () => {
      try {
        // Call database initialization endpoint
        const initResponse = await fetch('/api/init');
        if (!initResponse.ok) {
          console.warn('Database initialization returned non-200 status:', initResponse.status);
        } else {
          console.log('Database initialized successfully');
        }
      } catch (error) {
        console.warn('Database initialization failed (may already be initialized):', error);
      }

      // Load user from localStorage
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // Fetch users
      await refreshUsers();
    };

    initializeApp();
  }, []);

  const refreshUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (selectedUser: User) => {
    setUser(selectedUser);
    localStorage.setItem('currentUser', JSON.stringify(selectedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const createUser = async (name: string): Promise<User> => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    const newUser = await response.json();
    setUsers([...users, newUser]);
    return newUser;
  };

  return (
    <AuthContext.Provider value={{ user, users, loading, login, logout, createUser, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

