"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { User, UserRole } from "@/types";
import { api } from "@/lib/api";
import { parseJwt, isExpired } from "@/lib/jwt";
import { storage } from "@/lib/storage";

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

const routeByRole = (role: UserRole): string => {
  if (role === "borrower") return "/status"; // Changed from '/personal-details' to '/status'
  if (role === "admin") return "/admin";
  if (role === "sales") return "/sales";
  if (role === "sanction") return "/sanction";
  if (role === "disbursement") return "/disbursement";
  return "/collection";
};

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = storage.getToken();
    const storedUser = storage.getUser();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const payload = parseJwt(storedToken);
    if (!payload || isExpired(payload)) {
      storage.clearAll();
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setIsLoading(true);
      try {
        const result = await api.auth.login({ email, password });
        storage.setToken(result.token);
        storage.setUser(result.user);
        setToken(result.token);
        setUser(result.user);
        router.replace(routeByRole(result.user.role));
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const register = useCallback(
    async (data: {
      fullName: string;
      email: string;
      password: string;
    }): Promise<void> => {
      setIsLoading(true);
      try {
        const result = await api.auth.register(data);
        storage.setToken(result.token);
        storage.setUser(result.user);
        setToken(result.token);
        setUser(result.user);
        router.replace("/personal-details");
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  const logout = useCallback((): void => {
    storage.clearAll();
    setUser(null);
    setToken(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthState>(
    () => ({ user, token, isLoading, login, register, logout }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
