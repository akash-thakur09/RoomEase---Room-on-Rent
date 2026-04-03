import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';

const AuthContext = createContext(null);

// ── Helpers ──────────────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  token:  'token',
  userId: 'userId',
  email:  'userEmail',
  role:   'role',
  name:   'userName',
};

function readUserFromStorage() {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (!token) return null;
  return {
    token,
    userId: localStorage.getItem(STORAGE_KEYS.userId),
    email:  localStorage.getItem(STORAGE_KEYS.email),
    role:   localStorage.getItem(STORAGE_KEYS.role),
    name:   localStorage.getItem(STORAGE_KEYS.name),
  };
}

function persistUser(data) {
  localStorage.setItem(STORAGE_KEYS.token,  data.authToken);
  localStorage.setItem(STORAGE_KEYS.userId, data.userId);
  localStorage.setItem(STORAGE_KEYS.email,  data.email);
  localStorage.setItem(STORAGE_KEYS.role,   data.role);
  localStorage.setItem(STORAGE_KEYS.name,   data.name ?? '');
}

function clearStorage() {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUserFromStorage);

  /**
   * Call after a successful login / register API response.
   * Expects the `data` object from the API: { authToken, userId, role, name? }
   * plus `email` (echoed back from the form).
   */
  const login = useCallback((data) => {
    persistUser(data);
    setUser({
      token:  data.authToken,
      userId: data.userId,
      email:  data.email,
      role:   data.role,
      name:   data.name ?? '',
    });
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setUser(null);
  }, []);

  /**
   * Partially update stored user fields (e.g. after a profile update).
   */
  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      // Keep storage in sync for the fields we track
      if (patch.name  !== undefined) localStorage.setItem(STORAGE_KEYS.name,  patch.name);
      if (patch.email !== undefined) localStorage.setItem(STORAGE_KEYS.email, patch.email);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user,
      isTenant:        user?.role === 'tenant',
      isLandlord:      user?.role === 'landlord',
    }),
    [user, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
