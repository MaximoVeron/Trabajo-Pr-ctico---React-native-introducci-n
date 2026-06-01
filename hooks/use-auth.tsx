import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type User = {
  email: string;
  password: string;
};

type AuthContextType = {
  user: Omit<User, 'password'> | null;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function getUsers(): User[] {
  try {
    const data = localStorage.getItem('auth_users');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem('auth_users', JSON.stringify(users));
}

function getSession(): Omit<User, 'password'> | null {
  try {
    const data = localStorage.getItem('auth_session');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveSession(user: Omit<User, 'password'>) {
  localStorage.setItem('auth_session', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('auth_session');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (session) setUser(session);
    setReady(true);
  }, []);

  const login = (email: string, password: string): boolean => {
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (found) {
      const sessionUser = { email: found.email };
      setUser(sessionUser);
      saveSession(sessionUser);
      return true;
    }
    return false;
  };

  const register = (email: string, password: string): boolean => {
    const users = getUsers();
    if (users.find((u) => u.email === email)) return false;
    const newUser = { email, password };
    saveUsers([...users, newUser]);
    const sessionUser = { email: newUser.email };
    setUser(sessionUser);
    saveSession(sessionUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {ready ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
