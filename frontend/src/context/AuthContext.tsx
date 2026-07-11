"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken, unwrap } from "@/lib/api";
import { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (values: { email: string; username: string; password: string; displayName: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount, try to silently refresh the session using the httpOnly cookie.
  useEffect(() => {
    (async () => {
      try {
        const { accessToken } = await unwrap<{ accessToken: string }>(api.post("/auth/refresh"));
        setAccessToken(accessToken);
        const { user } = await unwrap<{ user: User }>(api.get("/auth/me"));
        setUser(user);
      } catch {
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function login(identifier: string, password: string) {
    const { user, accessToken } = await unwrap<{ user: User; accessToken: string }>(
      api.post("/auth/login", { identifier, password })
    );
    setAccessToken(accessToken);
    setUser(user);
    router.push("/home");
  }

  async function signup(values: { email: string; username: string; password: string; displayName: string }) {
    const { user, accessToken } = await unwrap<{ user: User; accessToken: string }>(
      api.post("/auth/signup", values)
    );
    setAccessToken(accessToken);
    setUser(user);
    router.push("/home");
  }

  async function logout() {
    await api.post("/auth/logout");
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider.");
  return ctx;
}
