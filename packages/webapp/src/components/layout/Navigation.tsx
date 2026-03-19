"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Главная", icon: "🏠" },
  { href: "/training", label: "Учёба", icon: "📚" },
  { href: "/exam", label: "Экзамен", icon: "📝" },
  { href: "/stats", label: "Стат.", icon: "📊" },
  { href: "/settings", label: "Ещё", icon: "⚙️" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-tg-bg/90 backdrop-blur-lg border-t border-tg-secondary-bg safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg
                transition-colors duration-150 min-w-[56px]
                ${isActive ? "text-tg-button" : "text-tg-hint"}
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
