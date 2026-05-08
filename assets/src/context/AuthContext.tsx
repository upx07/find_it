import { createContext, useContext, useState, type ReactNode } from "react";
import { gqlFetch, setToken, clearToken, getToken } from "../services/graphql";

interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "staff" | "admin";
  active: boolean;
}

const USER_KEY = "findit_user";

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fields: RegisterFields) => Promise<{ role: string }>;
  logout: () => void;
}

export interface RegisterFields {
  name: string;
  email: string;
  ra?: string;
  setor?: string;
  role: "student" | "staff";
  password: string;
  passwordConfirmation: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SIGN_IN = `
  query SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      id
      email
      name
      role
      active
      token
    }
  }
`;

const REGISTER = `
  mutation Register($input: RegisterWithPasswordInput!) {
    registerWithPassword(input: $input) {
      result {
        id
        email
        name
        role
        active
      }
      metadata {
        token
      }
    }
  }
`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const [token, setTokenState] = useState<string | null>(getToken());

  function persistUser(u: User | null) {
    saveUser(u);
    setUser(u);
  }

  async function login(email: string, password: string) {
    const data = await gqlFetch<{
      signIn: User & { token: string };
    }>(SIGN_IN, { email, password });
    const { token: jwt, ...userFields } = data.signIn;
    setToken(jwt);
    setTokenState(jwt);
    persistUser(userFields);
  }

  async function register(fields: RegisterFields) {
    const data = await gqlFetch<{
      registerWithPassword: { result: User; metadata: { token: string } };
    }>(REGISTER, {
      input: {
        name: fields.name,
        email: fields.email,
        ra: fields.ra || null,
        setor: fields.setor || null,
        role: fields.role,
        password: fields.password,
        passwordConfirmation: fields.passwordConfirmation,
      },
    });
    const { result, metadata } = data.registerWithPassword;
    setToken(metadata.token);
    setTokenState(metadata.token);
    persistUser(result);
    return { role: result.role };
  }

  function logout() {
    clearToken();
    saveUser(null);
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
