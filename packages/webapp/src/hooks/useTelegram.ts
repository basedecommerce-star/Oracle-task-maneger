"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getTelegramWebApp,
  getTelegramUser,
  isTelegramWebApp,
  hapticFeedback,
  showBackButton,
  hideBackButton,
  type TelegramWebApp,
} from "@/lib/telegram";

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.ready();
      tg.expand();
      setWebApp(tg);
      setIsReady(true);
    } else {
      setIsReady(true);
    }
  }, []);

  const user = getTelegramUser();
  const isTg = isTelegramWebApp();
  const colorScheme = webApp?.colorScheme || "light";

  const triggerHaptic = useCallback(
    (type: "impact" | "notification" | "selection", style?: string) => {
      hapticFeedback(type, style);
    },
    []
  );

  const enableBackButton = useCallback(
    (onClick: () => void) => {
      showBackButton(onClick);
    },
    []
  );

  const disableBackButton = useCallback(() => {
    hideBackButton();
  }, []);

  const showAlert = useCallback(
    (message: string) => {
      if (webApp) {
        webApp.showAlert(message);
      } else {
        alert(message);
      }
    },
    [webApp]
  );

  const showConfirm = useCallback(
    (message: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (webApp) {
          webApp.showConfirm(message, (confirmed) => resolve(confirmed));
        } else {
          resolve(confirm(message));
        }
      });
    },
    [webApp]
  );

  const close = useCallback(() => {
    webApp?.close();
  }, [webApp]);

  return {
    webApp,
    user,
    isReady,
    isTelegram: isTg,
    colorScheme,
    triggerHaptic,
    enableBackButton,
    disableBackButton,
    showAlert,
    showConfirm,
    close,
  };
}
