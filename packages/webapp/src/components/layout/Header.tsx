"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTelegram } from "@/hooks/useTelegram";
import { useEffect } from "react";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export function Header({ title, showBack = false }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { enableBackButton, disableBackButton } = useTelegram();

  const isHome = pathname === "/";

  useEffect(() => {
    if (showBack || !isHome) {
      enableBackButton(() => router.back());
    } else {
      disableBackButton();
    }
    return () => disableBackButton();
  }, [showBack, isHome, enableBackButton, disableBackButton, router]);

  if (!title && isHome) return null;

  return (
    <header className="sticky top-0 z-50 bg-tg-bg/80 backdrop-blur-lg border-b border-tg-secondary-bg">
      <div className="px-4 py-3 flex items-center gap-3">
        {(showBack || !isHome) && (
          <button
            onClick={() => router.back()}
            className="text-tg-link text-sm font-medium shrink-0 lg:hidden"
          >
            ← Назад
          </button>
        )}
        {title && (
          <h1 className="text-lg font-bold text-tg-text truncate">{title}</h1>
        )}
      </div>
    </header>
  );
}
