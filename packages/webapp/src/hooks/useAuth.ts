"use client";

import { useEffect } from "react";
import { api, setAuthToken } from "@/lib/api";
import { useAppStore } from "@/store/app.store";
import { useTelegram } from "./useTelegram";

export function useAuth() {
  const { user: tgUser, isTelegram, isReady } = useTelegram();
  const { user, setUser, setLoading, isLoading } = useAppStore();

  useEffect(() => {
    if (!isReady || user) return;

    async function authenticate() {
      setLoading(true);
      try {
        const response = await api.auth.login();
        setAuthToken(response.token);
        setUser(response.user);
      } catch (error) {
        console.error("Authentication failed:", error instanceof Error ? error.message : error);
      } finally {
        setLoading(false);
      }
    }

    if (isTelegram && tgUser) {
      authenticate();
    } else {
      setLoading(false);
    }
  }, [isReady, isTelegram, tgUser, user, setUser, setLoading]);

  return { user, isLoading, isAuthenticated: !!user };
}
