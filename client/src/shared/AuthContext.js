import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
      token,
      userId: localStorage.getItem('userId'),
      email: localStorage.getItem('userEmail'),
      role: localStorage.getItem('role'),
    };
  });

  const login = useCallback((data) => {
    localStorage.setItem('token', data.authToken);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('role', data.role);
    setUser({ token: data.authToken, userId: data.userId, email: data.email, role: data.role });
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
