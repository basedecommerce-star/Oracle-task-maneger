"use client";

import { useEffect } from "react";
import { api, setAccessToken } from "@/lib/api";
import { useAppStore } from "@/store/app.store";
import { useTelegram } from "./useTelegram";
import { getTelegramInitData } from "@/lib/telegram";

export function useAuth() {
  const { user, setUser, setLoading, isLoading } = useAppStore();
  const { user: tgUser, isTelegram, isReady } = useTelegram();

  useEffect(() => {
    if (!isReady || user) return;

    async function authenticate() {
      setLoading(true);
      try {
        const initData = getTelegramInitData();
        if (!initData) {
          throw new Error("No Telegram initData available");
        }
        const response = await api.auth.loginWithTelegram(initData);
        setAccessToken(response.accessToken);
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
