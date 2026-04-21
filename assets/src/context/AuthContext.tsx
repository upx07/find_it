import { createContext, useContext, useState, type ReactNode } from "react";
import { gqlFetch, setToken, clearToken, getToken } from "../services/graphql";

interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "staff" | "admin";
  active: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());

  async function login(email: string, password: string) {
    const data = await gqlFetch<{
      signIn: User & { token: string };
    }>(SIGN_IN, { email, password });
    const { token: jwt, ...userFields } = data.signIn;
    setToken(jwt);
    setTokenState(jwt);
    setUser(userFields);
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
    setUser(result);
    return { role: result.role };
  }

  function logout() {
    clearToken();
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
