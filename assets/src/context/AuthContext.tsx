import { createContext, useContext, useState, type ReactNode } from "react";
import { gqlFetch, setToken, clearToken, getToken } from "../services/graphql";

interface User {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SIGN_IN = `
  query SignIn($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      id
      email
      metadata {
        token
      }
    }
  }
`;

const REGISTER = `
  mutation Register($email: String!, $password: String!, $passwordConfirmation: String!) {
    registerWithPassword(email: $email, password: $password, passwordConfirmation: $passwordConfirmation) {
      id
      email
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
    const data = await gqlFetch<{ signIn: User & { metadata: { token: string } } }>(
      SIGN_IN,
      { email, password },
    );
    const { metadata, ...userFields } = data.signIn;
    setToken(metadata.token);
    setTokenState(metadata.token);
    setUser(userFields);
  }

  async function register(email: string, password: string, passwordConfirmation: string) {
    const data = await gqlFetch<{
      registerWithPassword: User & { metadata: { token: string } };
    }>(REGISTER, { email, password, passwordConfirmation });
    const { metadata, ...userFields } = data.registerWithPassword;
    setToken(metadata.token);
    setTokenState(metadata.token);
    setUser(userFields);
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
